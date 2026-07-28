import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useArticlesForAdmin, useCreateArticle, useDeleteArticle, usePublishArticle, useUpdateArticle } from "@/hooks/useContentApi";
import type { MyArticle } from "@/lib/api/content";

type FormState = {
  title: string;
  category: string;
  coverImage: string;
  tags: string;
  content: string;
  isPublished: boolean;
};

const emptyForm: FormState = { title: "", category: "", coverImage: "", tags: "", content: "", isPublished: false };

export function RitesCultureManager() {
  const articlesQuery = useArticlesForAdmin("RITES_CULTURES");
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const publishArticle = usePublishArticle();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MyArticle | null>(null);

  const articles = articlesQuery.data ?? [];

  useEffect(() => {
    if (!editingId) return;
    const article = articles.find((item) => item.id === editingId);
    if (!article) return;
    setForm({
      title: article.title,
      category: article.category ?? "",
      coverImage: "",
      tags: "",
      content: article.content,
      isPublished: article.isPublished,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCreating(true);
    setError("");
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setCreating(true);
    setError("");
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const setField = (key: keyof FormState) => (value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    setError("");
    if (!form.title.trim() || !form.content.trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (editingId) {
      updateArticle.mutate(
        {
          id: editingId,
          payload: {
            title: form.title.trim(),
            content: form.content.trim(),
            category: form.category.trim() || undefined,
            coverImage: form.coverImage.trim() || undefined,
            tags,
            isApproved: true,
          },
        },
        {
          onSuccess: () => {
            setNotice(`« ${form.title} » mis à jour.`);
            cancel();
          },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Échec de la mise à jour."),
        },
      );
    } else {
      createArticle.mutate(
        {
          space: "RITES_CULTURES",
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          tags,
          isPublished: form.isPublished,
        },
        {
          onSuccess: () => {
            setNotice(`« ${form.title} » créé.`);
            cancel();
          },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Échec de la création."),
        },
      );
    }
  };

  const isPending = createArticle.isPending || updateArticle.isPending;

  return (
    <div>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {!creating && (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={startCreate} className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827]">
            + Nouvel article Rites & Cultures
          </button>
        </div>
      )}

      {creating && (
        <div className="mb-6 rounded-[12px] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-[15px] font-bold text-white">{editingId ? "Modifier l'article" : "Nouvel article Rites & Cultures"}</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Titre *" value={form.title} onChange={setField("title")} />
            <Field label="Catégorie" value={form.category} onChange={setField("category")} placeholder="Rituel, tradition orale, cérémonie..." />
            <Field label="Image de couverture (URL)" value={form.coverImage} onChange={setField("coverImage")} />
            <Field label="Tags (séparés par des virgules)" value={form.tags} onChange={setField("tags")} />
          </div>

          <label className="mt-4 block text-[12px] font-semibold text-slate-300">
            Contenu *
            <textarea
              value={form.content}
              onChange={(event) => setField("content")(event.target.value)}
              rows={10}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-emerald-400"
            />
          </label>

          {!editingId && (
            <label className="mt-4 flex items-center gap-2 text-[13px] text-slate-300">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setField("isPublished")(event.target.checked)} />
              Publier immédiatement
            </label>
          )}

          {error && <p className="mt-3 text-[13px] font-semibold text-red-400">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer l'article"}
            </button>
            <button type="button" onClick={cancel} className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-[12px] border border-white/10">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-white/10 text-slate-300">
            <tr>{["Titre", "Catégorie", "Statut", "Vues", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {articlesQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>}
            {!articlesQuery.isLoading && articles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun article Rites & Cultures pour le moment.</td></tr>
            )}
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{article.title}</td>
                <td className="px-4 py-3 text-slate-200">{article.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${article.isPublished && article.isApproved ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>
                    {article.isPublished && article.isApproved ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-200">{article.views}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(article.id)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                      Modifier
                    </button>
                    {!(article.isPublished && article.isApproved) && (
                      <button
                        type="button"
                        disabled={publishArticle.isPending}
                        onClick={() => publishArticle.mutate(article.id, { onSuccess: () => setNotice(`« ${article.title} » publié.`) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        Publier
                      </button>
                    )}
                    <button type="button" onClick={() => setDeleteTarget(article)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Supprimer « ${deleteTarget?.title ?? ""} » ?`}
        description="Cet article sera définitivement supprimé."
        danger
        confirmLabel="Supprimer"
        pending={deleteArticle.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteArticle.mutate(deleteTarget.id, {
            onSuccess: () => {
              setNotice(`« ${deleteTarget.title} » supprimé.`);
              setDeleteTarget(null);
            },
          });
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[12px] font-semibold text-slate-300">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}
