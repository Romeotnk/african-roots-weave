import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChefHat, Clock, Coffee, Leaf, Soup } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { HeroSection } from "@/components/shared/HeroSection";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { SearchBar } from "@/components/shared/SearchBar";
import { SimplePager } from "@/components/shared/SimplePager";
import { useArticles } from "@/hooks/useContentApi";
import { useDebounce } from "@/hooks/useDebounce";
import type { BackendArticle } from "@/components/editorial/ArticleListPage";
import type { Recipe } from "@/types";

const themes = [
  { name: "Infusion", icon: Coffee, color: "bg-amber-50 text-amber-700" },
  { name: "Decoction", icon: Soup, color: "bg-orange-50 text-orange-700" },
  { name: "Cataplasme", icon: Leaf, color: "bg-green-50 text-green-700" },
  { name: "Preparation culinaire", icon: ChefHat, color: "bg-rose-50 text-rose-700" },
];

const fallbackCover = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80&auto=format&fit=crop";

export function toRecipe(article: BackendArticle, t: TFunction): Recipe | null {
  if (!article.id || !article.slug || !article.title) return null;
  const recipeData = article.recipeData ?? {};
  const body = article.content ?? "";
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: body.replace(/<[^>]*>/g, "").slice(0, 180) || t("recipeList.defaultExcerpt"),
    image: article.coverImage ?? fallbackCover,
    type: (recipeData.type as Recipe["type"]) ?? "Infusion",
    difficulty: (recipeData.difficulty as Recipe["difficulty"]) ?? "Facile",
    prepTime: recipeData.prepTime ?? "15 min",
    plants: recipeData.plants ?? [],
    ingredients: recipeData.ingredients ?? [],
    steps: recipeData.steps ?? [],
    cautions: recipeData.cautions ?? [],
  };
}

export function RecipeListPage() {
  const { t } = useTranslation();
  const themeLabels: Record<string, string> = {
    Infusion: t("recipeList.themeInfusion"),
    Decoction: t("recipeList.themeDecoction"),
    Cataplasme: t("recipeList.themePoultice"),
    "Preparation culinaire": t("recipeList.themeCulinaryPrep"),
  };
  const difficultyLabels: Record<string, string> = {
    Facile: t("recipeList.difficultyEasy"),
    Intermediaire: t("recipeList.difficultyIntermediate"),
    Avance: t("recipeList.difficultyAdvanced"),
  };
  const [page, setPage] = useState(1);
  const articlesQuery = useArticles({ space: "RECETTES_SANTE", page });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);
  const isUnfiltered = type === "Toutes" && !debouncedSearch;
  const pagination = articlesQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [type, debouncedSearch]);

  const apiRecipes = useMemo(
    () => ((articlesQuery.data?.articles ?? []) as BackendArticle[]).map((article) => toRecipe(article, t)).filter((item): item is Recipe => Boolean(item)),
    [articlesQuery.data, t],
  );
  const allRecipes = apiRecipes;

  // Hide themes with no recipes yet instead of advertising a "0 recettes" dead end.
  const populatedThemes = useMemo(
    () => themes.filter((theme) => allRecipes.some((recipe) => recipe.type === theme.name)),
    [allRecipes],
  );

  const filteredRecipes = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    return allRecipes.filter((recipe) => {
      const searchable = [recipe.title, recipe.excerpt, recipe.type, recipe.difficulty, ...recipe.ingredients, ...recipe.plants.map((plant) => plant.name)]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalized || searchable.includes(normalized);
      const matchesType = type === "Toutes" || recipe.type === type;
      return matchesSearch && matchesType;
    });
  }, [allRecipes, debouncedSearch, type]);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge={t("recipeList.heroBadge")}
        title={t("recipeList.heroTitle")}
        subtitle={t("recipeList.heroSubtitle")}
        size="md"
      >
        <div className="mx-auto max-w-2xl">
          <SearchBar placeholder={t("recipeList.searchPlaceholder")} value={search} onChange={setSearch} showFilters={false} />
        </div>
      </HeroSection>

      <section className="py-16">
        <div className="container-iwosan">
          <h2 className="mb-8 text-[28px]">{t("recipeList.browseByTheme")}</h2>
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {populatedThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setType((current) => (current === theme.name ? "Toutes" : theme.name))}
                className={`rounded-[20px] border p-6 text-left transition card-hover ${
                  type === theme.name ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border-light)] bg-white"
                }`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${theme.color}`}>
                  <theme.icon size={22} />
                </div>
                <h3 className="text-[16px] font-bold">{themeLabels[theme.name] ?? theme.name}</h3>
                <p className="mt-1 text-[12px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t("recipeList.recipeCount", { count: allRecipes.filter((recipe) => recipe.type === theme.name).length })}
                </p>
              </button>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text-primary)]">{filteredRecipes.length}</strong> {t("recipeList.recipesFound")}
                {debouncedSearch ? t("recipeList.recipesFoundFor", { query: debouncedSearch }) : ""}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredRecipes.map((recipe, index) => (
                  <Reveal key={recipe.id} delayMs={staggerDelay(index % 6)}>
                    <article className="group overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-iwosan-lg">
                      <div className="overflow-hidden">
                        <img src={recipe.image} alt={recipe.title} loading="lazy" decoding="async" className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
                          <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 font-semibold text-[var(--brand-primary)]">{themeLabels[recipe.type] ?? recipe.type}</span>
                          <span>{difficultyLabels[recipe.difficulty] ?? recipe.difficulty}</span>
                          <span className="inline-flex items-center gap-1"><Clock size={13} /> {recipe.prepTime}</span>
                        </div>
                        <h3 className="text-[18px] font-bold">{recipe.title}</h3>
                        <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{recipe.excerpt}</p>
                        <Link to="/recettes-sante/$slug" params={{ slug: recipe.slug }} className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
                          {t("recipeList.viewRecipe")}
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
              {filteredRecipes.length === 0 && (
                <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
                  <p className="font-bold">{t("recipeList.noRecipeMatch")}</p>
                </div>
              )}
              {isUnfiltered && pagination && (
                <SimplePager page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
              )}
            </div>
            <aside className="h-fit rounded-[12px] bg-[var(--brand-primary)] p-6 text-white">
              <h3 className="mb-2 text-[18px] font-bold">{t("recipeList.needHelp")}</h3>
              <p className="mb-5 text-[14px] leading-[1.6] text-white/80">
                {t("recipeList.needHelpDesc")}
              </p>
              <Link to="/aide" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-gold)] font-semibold text-[var(--color-text-primary)]">
                {t("recipeList.openTicket")}
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
