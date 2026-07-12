import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Archive, CheckCircle2, Edit3, Eye, FileText, Plus, Search, Send, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

type ArticleStatus = "draft" | "review" | "published" | "archived";

type Article = {
  id: string;
  title: string;
  category: string;
  status: ArticleStatus;
  views: number;
  updatedAt: string;
  excerpt: string;
};

const initialArticles: Article[] = [
  { id: "a-1", title: "Bien utiliser le moringa au quotidien", category: "Sante quotidien", status: "published", views: 1280, updatedAt: "08/07/2026", excerpt: "Conseils simples pour integrer le moringa sans exagerer les doses." },
  { id: "a-2", title: "Rituel de bain aux feuilles locales", category: "Rites & Cultures", status: "review", views: 0, updatedAt: "06/07/2026", excerpt: "Article envoye a la moderation editoriale IWOSAN." },
  { id: "a-3", title: "Recette infusion digestion", category: "Recettes sante", status: "draft", views: 0, updatedAt: "02/07/2026", excerpt: "Brouillon a completer avant publication." },
];

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Brouillon",
  review: "En validation",
  published: "Publie",
  archived: "Archive",
};

const statusClasses: Record<ArticleStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  review: "bg-amber-50 text-amber-700 border-amber-100",
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  archived: "bg-red-50 text-red-700 border-red-100",
};

function BlogPage() {
  const [articles, setArticles] = useState(initialArticles);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sante quotidien");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [article.title, article.category, article.excerpt].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [articles, query, statusFilter]);

  const publishedCount = articles.filter((article) => article.status === "published").length;
  const reviewCount = articles.filter((article) => article.status === "review").length;
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);

  const createDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (title.trim().length < 8) {
      setError("Le titre doit contenir au moins 8 caracteres.");
      return;
    }

    setArticles((current) => [
      {
        id: `a-${Date.now()}`,
        title: title.trim(),
        category,
        status: "draft",
        views: 0,
        updatedAt: new Date().toLocaleDateString("fr-FR"),
        excerpt: "Nouveau brouillon cree depuis votre espace professionnel.",
      },
      ...current,
    ]);
    setTitle("");
    setMessage("Brouillon cree. Vous pouvez maintenant le completer dans l'editeur.");
  };

  const setStatus = (id: string, status: ArticleStatus) => {
    setArticles((current) => current.map((article) => (article.id === id ? { ...article, status } : article)));
    setMessage(`Article ${statusLabels[status].toLowerCase()} avec succes.`);
    setError("");
  };

  const deleteArticle = (id: string) => {
    setArticles((current) => current.filter((article) => article.id !== id));
    setMessage("Article supprime de la liste locale.");
    setError("");
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Editorial</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">Mon blog</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Preparez vos articles, suivez la moderation et gerez vos publications.
                </p>
              </div>
              <Link to="/sante-quotidien" className="btn-secondary h-11 px-5 text-[14px]">
                <Eye size={17} /> Voir le blog public
              </Link>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={CheckCircle2} label="Publies" value={String(publishedCount)} />
            <StatCard icon={Send} label="En validation" value={String(reviewCount)} />
            <StatCard icon={Eye} label="Lectures" value={String(totalViews)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <form onSubmit={createDraft} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">Nouveau brouillon</h2>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                Titre
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Les bienfaits du moringa"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                Rubrique
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option>Sante quotidien</option>
                  <option>Rites & Cultures</option>
                  <option>Recettes sante</option>
                  <option>Pharmacopee</option>
                </select>
              </label>
              <button type="submit" className="btn-primary mt-5 h-11 w-full text-[14px]">
                <Plus size={17} /> Creer le brouillon
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </form>

            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un article"
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "published", "review", "draft", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                        statusFilter === status
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {status === "all" ? "Tous" : statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {filteredArticles.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <FileText className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">Aucun article trouve</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez une autre recherche ou creez un brouillon.</p>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <article key={article.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{article.title}</h2>
                            <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[article.status]}`}>{statusLabels[article.status]}</span>
                          </div>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{article.category} - {article.updatedAt} - {article.views} vues</p>
                          <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">{article.excerpt}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setStatus(article.id, "review")} className="btn-secondary h-10 px-4 text-[13px]"><Send size={16} /> Envoyer</button>
                        <button type="button" onClick={() => setStatus(article.id, "published")} className="btn-secondary h-10 px-4 text-[13px]"><Edit3 size={16} /> Publier</button>
                        <button type="button" onClick={() => setStatus(article.id, "archived")} className="btn-secondary h-10 px-4 text-[13px]"><Archive size={16} /> Archiver</button>
                        <button type="button" onClick={() => deleteArticle(article.id)} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 hover:bg-red-100"><Trash2 size={16} /> Supprimer</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/blog")({
  head: () => ({ meta: [{ title: "Mon blog - IWOSAN" }] }),
  component: BlogPage,
});