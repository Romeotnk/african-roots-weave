import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { articles } from "@/data/articles";
import { useArticles, type ArticleSpace } from "@/hooks/useContentApi";
import { useDebounce } from "@/hooks/useDebounce";
import type { Article } from "@/types";

interface ArticleListPageProps {
  space: string;
  title: string;
  badge: string;
  subtitle: string;
  image: string;
  warning?: string;
}

const fallbackCover = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80&auto=format&fit=crop";
const fallbackAvatar = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&q=80&auto=format&fit=crop";

const spaceToApi: Record<string, ArticleSpace> = {
  "Sante au quotidien": "SANTE_NATURELLE",
  "Rites & Cultures": "RITES_CULTURES",
  Pharmacopee: "PHARMACOPEE",
  Recherche: "RECHERCHE",
};

type BackendArticle = {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  coverImage?: string | null;
  space?: string;
  category?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  createdAt?: string;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
  } | null;
};

function toArticle(article: BackendArticle, fallbackSpace: string): Article | null {
  if (!article.id || !article.slug || !article.title) return null;
  const body = article.content ?? "";
  const excerpt = body.replace(/<[^>]*>/g, "").slice(0, 180) || "Article IWOSAN.";
  const authorName = [article.author?.firstName, article.author?.lastName].filter(Boolean).join(" ").trim();
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt,
    body,
    cover: article.coverImage ?? fallbackCover,
    space: fallbackSpace,
    category: article.category ?? article.tags?.[0] ?? fallbackSpace,
    readTime: Math.max(3, Math.ceil(body.length / 900)),
    date: article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    authorName: authorName || "Equipe IWOSAN",
    authorAvatar: fallbackAvatar,
    authorSpecialty: article.author?.role ?? "Contributeur",
  };
}

export function ArticleListPage({ space, title, badge, subtitle, image, warning }: ArticleListPageProps) {
  const apiSpace = spaceToApi[space];
  const articlesQuery = useArticles(apiSpace ? { space: apiSpace } : {});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);

  const apiArticles = useMemo(
    () => ((articlesQuery.data?.articles ?? []) as BackendArticle[]).map((article) => toArticle(article, space)).filter(Boolean) as Article[],
    [articlesQuery.data, space],
  );
  const spaceArticles = useMemo(() => (apiArticles.length > 0 ? apiArticles : articles.filter((article) => article.space === space)), [apiArticles, space]);
  const categories = ["Toutes", ...Array.from(new Set(spaceArticles.map((article) => article.category ?? article.space)))];

  const filteredArticles = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    return spaceArticles.filter((article) => {
      const matchesSearch =
        !normalized ||
        [article.title, article.excerpt, article.body ?? "", article.category ?? "", article.authorName]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory = category === "Toutes" || article.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, debouncedSearch, spaceArticles]);

  return (
    <>
      <HeroSection image={image} badge={badge} title={title} subtitle={subtitle} size="md">
        <div className="mx-auto max-w-2xl">
          <SearchBar placeholder="Rechercher un article..." value={search} onChange={setSearch} showFilters={false} />
        </div>
      </HeroSection>

      <section className="py-12 md:py-16">
        <div className="container-iwosan grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {warning && (
              <div className="flex gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
                <AlertTriangle size={18} className="shrink-0" />
                <p>{warning}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                    category === item
                      ? "bg-[var(--brand-primary)] text-white"
                      : "border border-[var(--brand-border)] bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="text-[14px] text-[var(--color-text-muted)]">
              <strong className="text-[var(--color-text-primary)]">{filteredArticles.length}</strong> articles
              {debouncedSearch ? ` pour "${debouncedSearch}"` : ""}
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
                <p className="font-bold">Aucun article trouve</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("Toutes");
                  }}
                  className="mt-4 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
              <h3 className="mb-4 text-[15px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Categories
              </h3>
              <ul className="space-y-2 text-[14px]">
                {categories.slice(1).map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setCategory(item)}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[12px] bg-[var(--brand-primary-subtle)] p-6">
              <h3 className="mb-3 text-[15px] font-bold text-[var(--brand-primary)]">Articles populaires</h3>
              <ol className="space-y-3 text-[14px]">
                {spaceArticles.slice(0, 5).map((article, index) => (
                  <li key={article.id} className="flex gap-3">
                    <span className="font-extrabold text-[var(--brand-primary)]">{index + 1}</span>
                    <Link to="/sante-au-quotidien/$slug" params={{ slug: article.slug }} className="text-[var(--color-text-secondary)]">
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
