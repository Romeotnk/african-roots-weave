import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Code, Image, Italic, List, Loader2, Paperclip, Send, X } from "lucide-react";
import { useCreateForumQuestion, useForumCategories, useForumSearch, useUploadForumAttachments } from "@/hooks/useForumApi";
import { useDebounce } from "@/hooks/useDebounce";

type SearchResult = { id: string; title: string };

export const Route = createFileRoute("/forum/nouvelle-question")({
  head: () => ({ meta: [{ title: "Nouvelle question - Forum IWOSAN" }] }),
  component: NewQuestion,
});

const suggestedTags = ["pharmacopee", "grossesse", "securite", "posologie", "karite", "neem", "douleur", "nutrition"];
const severityOptions = ["", "Léger", "Modéré", "Sévère"];

function NewQuestion() {
  const navigate = useNavigate();
  const createQuestion = useCreateForumQuestion();
  const uploadAttachments = useUploadForumAttachments();
  const categoriesQuery = useForumCategories();
  const categories = categoriesQuery.data ?? [];
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [severity, setSeverity] = useState("");
  const [tags, setTags] = useState<string[]>(["pharmacopee"]);
  const [draftTag, setDraftTag] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [editorNotice, setEditorNotice] = useState("");
  const [attachmentNotice, setAttachmentNotice] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const debouncedTitle = useDebounce(title, 300);

  useEffect(() => {
    if (categoryId || categories.length === 0) return;
    const first = categories[0];
    setCategoryId(first.children?.[0]?.id ?? first.id);
  }, [categories, categoryId]);

  const searchQuery = useForumSearch(debouncedTitle);
  const similarQuestions = useMemo<SearchResult[]>(() => {
    if (debouncedTitle.trim().length < 8) return [];
    return ((searchQuery.data ?? []) as SearchResult[]).slice(0, 3);
  }, [searchQuery.data, debouncedTitle]);

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    setTags((current) => [...current, clean].slice(0, 6));
    setDraftTag("");
    setDraftSaved(false);
  };

  const applyFormatting = (label: string) => {
    const snippets: Record<string, string> = {
      Gras: "**texte important**",
      Italique: "_précision_",
      Liste: "\n- point important\n- autre point",
      Code: "`extrait ou dosage`",
      Image: "\n![description de l image](url)",
    };
    setBody((current) => `${current}${current ? "\n" : ""}${snippets[label] ?? ""}`);
    setEditorNotice(`${label} ajouté dans le corps de la question.`);
    setSubmitted(false);
    setDraftSaved(false);
  };

  const saveDraft = () => {
    window.localStorage.setItem("iwosan.forumDraft", JSON.stringify({ title, body, categoryId, severity, tags }));
    setDraftSaved(true);
    setFormError("");
  };

  const submitQuestion = () => {
    if (title.trim().length < 12) {
      setFormError("Le titre doit contenir au moins 12 caractères.");
      return;
    }
    if (body.trim().length < 40) {
      setFormError("Ajoutez plus de contexte dans le corps de la question.");
      return;
    }
    if (tags.length === 0) {
      setFormError("Ajoutez au moins un tag.");
      return;
    }

    setFormError("");
    createQuestion.mutate(
      {
        title: title.trim(),
        content: body.trim(),
        categoryId,
        customFields: severity ? { severite: severity } : undefined,
        tags,
        attachments,
      },
      {
        onSuccess: (created) => {
          setSubmitted(true);
          setDraftSaved(false);
          setAttachments([]);
          window.localStorage.removeItem("iwosan.forumDraft");
          const createdId = (created as { id?: string } | null)?.id;
          if (createdId) {
            navigate({ to: "/forum/$id", params: { id: createdId } });
          }
        },
        onError: (error) => {
          setFormError(error instanceof Error ? error.message : "Impossible de publier la question.");
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <Link to="/forum" className="text-[13px] font-semibold text-[var(--brand-primary)]">
            Retour au forum
          </Link>
          <h1 className="mt-4 text-[34px] md:text-[46px]">Poser une question</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            Formulaire avec détection de doublons, catégorie, tags, brouillon et validation avant publication.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitQuestion();
          }}
          className="space-y-5"
        >
          {formError && <p className="rounded-[12px] bg-red-50 p-4 text-[13px] font-semibold text-red-700">{formError}</p>}

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <label htmlFor="question-title" className="mb-2 block text-[13px] font-bold">Titre</label>
            <input
              id="question-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSubmitted(false);
                setDraftSaved(false);
              }}
              maxLength={160}
              placeholder="Ex. Quelle posologie de kinkeliba pour un adulte ?"
              className="h-12 w-full rounded-lg border border-[var(--brand-border)] px-4"
            />
            <div className="mt-2 flex justify-between text-[12px] text-[var(--color-text-muted)]">
              <span>Soyez précis et concret.</span>
              <span>{title.length}/160</span>
            </div>

            {similarQuestions.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4">
                <p className="text-[13px] font-bold text-amber-900">Questions similaires possibles</p>
                <div className="mt-3 space-y-2">
                  {similarQuestions.map((question) => (
                    <Link
                      key={question.id}
                      to="/forum/$id"
                      params={{ id: question.id }}
                      className="block rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[var(--brand-primary)]"
                    >
                      {question.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <label htmlFor="question-body" className="mb-2 block text-[13px] font-bold">Corps de la question</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                { icon: Bold, label: "Gras" },
                { icon: Italic, label: "Italique" },
                { icon: List, label: "Liste" },
                { icon: Code, label: "Code" },
                { icon: Image, label: "Image" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyFormatting(label)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-border)]"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <textarea
              id="question-body"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setSubmitted(false);
                setDraftSaved(false);
              }}
              rows={10}
              placeholder="Contexte, âge, pays, préparation utilisée, précautions déjà prises..."
              className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            {editorNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">{editorNotice}</p>}
            <div className="mt-2 flex justify-between text-[12px] text-[var(--color-text-muted)]">
              <span>Donnez assez de contexte pour recevoir une réponse utile.</span>
              <span>{body.trim().length} caractères</span>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="question-category" className="mb-2 block text-[13px] font-bold">Catégorie</label>
                <select
                  id="question-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
                >
                  {categories.map((item) => (
                    <optgroup key={item.id} label={item.name}>
                      <option value={item.id}>{item.name}</option>
                      {(item.children ?? []).map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question-severity" className="mb-2 block text-[13px] font-bold">Sévérité (facultatif)</label>
                <select
                  id="question-severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
                >
                  {severityOptions.map((option) => (
                    <option key={option || "none"} value={option}>
                      {option || "Non précisée"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question-tags" className="mb-2 block text-[13px] font-bold">Tags</label>
                <div className="flex gap-2">
                  <input
                    id="question-tags"
                    value={draftTag}
                    onChange={(event) => setDraftTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag(draftTag);
                      }
                    }}
                    placeholder="Ajouter un tag"
                    className="h-12 min-w-0 flex-1 rounded-lg border border-[var(--brand-border)] px-4"
                  />
                  <button type="button" onClick={() => addTag(draftTag)} className="h-12 rounded-lg bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                  className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                >
                  x #{tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-[var(--brand-border)] px-3 py-1 text-[12px] font-semibold"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-5">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <Paperclip size={24} className="text-[var(--brand-primary)]" />
              <p className="font-semibold">Ajouter des images ou fichiers utiles</p>
              <p className="max-w-md text-[13px] text-[var(--color-text-muted)]">
                Ajoutez une image, une photo de plante ou un document utile pour contextualiser la question.
              </p>
              <input
                ref={attachmentInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (files.length === 0) return;
                  setAttachmentNotice("");
                  uploadAttachments.mutate(files, {
                    onSuccess: (urls) => {
                      setAttachments((current) => [...current, ...urls]);
                      setAttachmentNotice(`${urls.length} fichier(s) ajouté(s) à la question.`);
                    },
                    onError: (error) =>
                      setAttachmentNotice(error instanceof Error ? error.message : "Impossible d'envoyer ces fichiers."),
                  });
                }}
              />
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadAttachments.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:opacity-50"
              >
                {uploadAttachments.isPending && <Loader2 size={14} className="animate-spin" />}
                Choisir des fichiers
              </button>
              {attachmentNotice && <p className="max-w-md rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">{attachmentNotice}</p>}
              {attachments.length > 0 && (
                <ul className="w-full max-w-md space-y-1.5 text-left">
                  {attachments.map((url) => (
                    <li key={url} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px]">
                      <a href={url} target="_blank" rel="noreferrer" className="truncate text-[var(--brand-primary)]">{url}</a>
                      <button
                        type="button"
                        onClick={() => setAttachments((current) => current.filter((item) => item !== url))}
                        className="shrink-0 text-[var(--color-text-muted)] hover:text-red-600"
                        aria-label="Retirer ce fichier"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {draftSaved && (
            <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
              Brouillon enregistré.
            </div>
          )}
          {submitted && (
            <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
              Question prête à publier. Elle sera visible dans le forum après validation.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={saveDraft} className="h-11 rounded-full border border-[var(--brand-border)] px-5 text-[13px] font-semibold">
              Enregistrer brouillon
            </button>
            <button
              type="submit"
              disabled={createQuestion.isPending}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Send size={15} /> {createQuestion.isPending ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">Conseils de qualité</h2>
          <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <li>Donnez le contexte sans publier de données médicales sensibles.</li>
            <li>Précisez le pays, l'âge approximatif et la préparation utilisée si pertinent.</li>
            <li>Indiquez si un professionnel de santé suit déjà la situation.</li>
            <li>Ajoutez des tags clairs pour aider les praticiens à trouver la question.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

