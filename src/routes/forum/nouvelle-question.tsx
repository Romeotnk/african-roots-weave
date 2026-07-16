import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Bold, Code, Image, Italic, List, Paperclip, Send } from "lucide-react";
import { forumCategories, questions } from "@/data/questions";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/forum/nouvelle-question")({
  head: () => ({ meta: [{ title: "Nouvelle question - Forum IWOSAN" }] }),
  component: NewQuestion,
});

const suggestedTags = ["pharmacopee", "grossesse", "securite", "posologie", "karite", "neem", "douleur", "nutrition"];

function NewQuestion() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(forumCategories[0].name);
  const [tags, setTags] = useState<string[]>(["pharmacopee"]);
  const [draftTag, setDraftTag] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [editorNotice, setEditorNotice] = useState("");
  const [attachmentNotice, setAttachmentNotice] = useState("");
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const debouncedTitle = useDebounce(title, 300);

  const similarQuestions = useMemo(() => {
    const normalized = debouncedTitle.trim().toLowerCase();
    if (normalized.length < 8) return [];
    const tokens = normalized.split(/\s+/).filter((token) => token.length > 3);
    return questions
      .filter((question) => tokens.some((token) => `${question.title} ${question.excerpt} ${question.tags.join(" ")}`.toLowerCase().includes(token)))
      .slice(0, 3);
  }, [debouncedTitle]);

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
    window.localStorage.setItem("iwosan.forumDraft", JSON.stringify({ title, body, category, tags }));
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
    setSubmitted(true);
    setDraftSaved(false);
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
            <label className="mb-2 block text-[13px] font-bold">Titre</label>
            <input
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
            <label className="mb-2 block text-[13px] font-bold">Corps de la question</label>
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
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setSubmitted(false);
                setDraftSaved(false);
              }}
              rows={10}
              placeholder="Contexte, âge, pays, préparation utilisée, precautions deja prises..."
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
                <label className="mb-2 block text-[13px] font-bold">Catégorie</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
                >
                  {forumCategories.map((item) => (
                    <optgroup key={item.name} label={item.name}>
                      <option value={item.name}>{item.name}</option>
                      {item.children.map((child) => (
                        <option key={child} value={child}>
                          {child}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-bold">Tags</label>
                <div className="flex gap-2">
                  <input
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
                  const count = event.target.files?.length ?? 0;
                  if (count === 0) return;
                  setAttachmentNotice(`${count} fichier(s) ajouté(s) à la question.`);
                }}
              />
              <button type="button" onClick={() => attachmentInputRef.current?.click()} className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                Choisir des fichiers
              </button>              {attachmentNotice && <p className="max-w-md rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">{attachmentNotice}</p>}
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
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
            >
              <Send size={15} /> Publier
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">Conseils de qualité</h2>
          <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <li>Donnez le contexte sans publier de données médicales sensibles.</li>
            <li>Précisez pays, âge approximatif et préparation utilisée si pertinent.</li>
            <li>Indiquez si un professionnel de santé suit déjà la situation.</li>
            <li>Ajoutez des tags clairs pour aider les praticiens à trouver la question.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
