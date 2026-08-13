import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useArticlesForAdmin, useCreateArticle, useDeleteArticle, usePublishArticle, useUpdateArticle } from "@/hooks/useContentApi";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";
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
  const { t } = useTranslation();
  const articlesQuery = useArticlesForAdmin("RITES_CULTURES");
  const categoriesQuery = useTaxonomy("ARTICLE_CATEGORY");
  const categories = categoriesQuery.data ?? [];
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
      setError(t("admin.ritesCultureManager.titleContentRequired"));
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
            setNotice(t("admin.ritesCultureManager.updated", { title: form.title }));
            cancel();
          },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("admin.ritesCultureManager.updateFailed")),
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
            setNotice(t("admin.ritesCultureManager.created", { title: form.title }));
            cancel();
          },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("admin.ritesCultureManager.createFailed")),
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
            {t("admin.ritesCultureManager.newArticle")}
          </button>
        </div>
      )}

      {creating && (
        <div className="mb-6 rounded-[12px] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-[15px] font-bold text-white">{editingId ? t("admin.ritesCultureManager.editArticle") : t("admin.ritesCultureManager.newArticle")}</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label={t("admin.ritesCultureManager.titleLabel")} value={form.title} onChange={setField("title")} />
            <label className="block text-[12px] font-semibold text-slate-300">
              {t("admin.ritesCultureManager.category")}
              <select
                value={form.category}
                onChange={(event) => setField("category")(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
              >
                <option value="">{t("admin.ritesCultureManager.noCategory")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <Field label={t("admin.ritesCultureManager.coverImage")} value={form.coverImage} onChange={setField("coverImage")} />
            <Field label={t("admin.ritesCultureManager.tags")} value={form.tags} onChange={setField("tags")} />
          </div>

          <label className="mt-4 block text-[12px] font-semibold text-slate-300">
            {t("admin.ritesCultureManager.content")}
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
              {t("admin.ritesCultureManager.publishImmediately")}
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
              {isPending ? t("admin.ritesCultureManager.saving") : editingId ? t("admin.ritesCultureManager.save") : t("admin.ritesCultureManager.createArticle")}
            </button>
            <button type="button" onClick={cancel} className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80">
              {t("admin.ritesCultureManager.cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-[12px] border border-white/10">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-white/10 text-slate-300">
            <tr>{[
              t("admin.ritesCultureManager.headerTitle"),
              t("admin.ritesCultureManager.headerCategory"),
              t("admin.ritesCultureManager.headerStatus"),
              t("admin.ritesCultureManager.headerViews"),
              t("admin.ritesCultureManager.headerActions"),
            ].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {articlesQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.ritesCultureManager.loading")}</td></tr>}
            {!articlesQuery.isLoading && articles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.ritesCultureManager.noArticles")}</td></tr>
            )}
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{article.title}</td>
                <td className="px-4 py-3 text-slate-200">{article.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${article.isPublished && article.isApproved ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>
                    {article.isPublished && article.isApproved ? t("admin.ritesCultureManager.published") : t("admin.ritesCultureManager.draft")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-200">{article.views}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(article.id)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                      {t("admin.ritesCultureManager.edit")}
                    </button>
                    {!(article.isPublished && article.isApproved) && (
                      <button
                        type="button"
                        disabled={publishArticle.isPending}
                        onClick={() => publishArticle.mutate(article.id, { onSuccess: () => setNotice(t("admin.ritesCultureManager.publishedNotice", { title: article.title })) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.ritesCultureManager.publish")}
                      </button>
                    )}
                    <button type="button" onClick={() => setDeleteTarget(article)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                      {t("admin.ritesCultureManager.delete")}
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
        title={t("admin.ritesCultureManager.deleteConfirmTitle", { title: deleteTarget?.title ?? "" })}
        description={t("admin.ritesCultureManager.deleteConfirmDescription")}
        danger
        confirmLabel={t("admin.ritesCultureManager.delete")}
        pending={deleteArticle.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteArticle.mutate(deleteTarget.id, {
            onSuccess: () => {
              setNotice(t("admin.ritesCultureManager.deleted", { title: deleteTarget.title }));
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
