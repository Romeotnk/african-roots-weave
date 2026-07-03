import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
            Formulaire mock avec detection de doublons, categorie, tags, editeur simple et pieces jointes.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-5"
        >
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <label className="mb-2 block text-[13px] font-bold">Titre</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="Ex. Quelle posologie de kinkeliba pour un adulte ?"
              className="h-12 w-full rounded-lg border border-[var(--brand-border)] px-4"
            />
            <div className="mt-2 flex justify-between text-[12px] text-[var(--color-text-muted)]">
              <span>Soyez precis et concret.</span>
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
              {[Bold, Italic, List, Code, Image].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-border)]"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              placeholder="Contexte, age, pays, preparation utilisee, precautions deja prises..."
              className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
              TipTap sera branche plus tard si necessaire. Ici, l'editeur simple couvre le flux UI.
            </p>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold">Categorie</label>
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
                Mock UI : photos de plante, ordonnance anonymisee, schema de preparation. Upload reel en section API.
              </p>
              <button type="button" className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                Choisir des fichiers
              </button>
            </div>
          </div>

          {submitted && (
            <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
              Question creee en mock. Apres connexion API, elle sera sauvegardee et visible dans le forum.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" className="h-11 rounded-full border border-[var(--brand-border)] px-5 text-[13px] font-semibold">
              Enregistrer brouillon
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !body.trim() || tags.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Send size={15} /> Publier
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">Conseils de qualite</h2>
          <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <li>Donnez le contexte sans publier de donnees medicales sensibles.</li>
            <li>Precisez pays, age approximatif et preparation utilisee si pertinent.</li>
            <li>Indiquez si un professionnel de sante suit deja la situation.</li>
            <li>Ajoutez des tags clairs pour aider les praticiens a trouver la question.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
