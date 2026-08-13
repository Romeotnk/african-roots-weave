import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, Clock, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useArticle } from "@/hooks/useContentApi";
import { toRecipe } from "@/components/editorial/RecipeListPage";
import type { BackendArticle } from "@/components/editorial/ArticleListPage";

const themeKeys: Record<string, string> = {
  Infusion: "recipeList.themeInfusion",
  Decoction: "recipeList.themeDecoction",
  Cataplasme: "recipeList.themePoultice",
  "Preparation culinaire": "recipeList.themeCulinaryPrep",
};

const difficultyKeys: Record<string, string> = {
  Facile: "recipeList.difficultyEasy",
  Intermediaire: "recipeList.difficultyIntermediate",
  Avance: "recipeList.difficultyAdvanced",
};

export function RecipeDetailPage({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const articleQuery = useArticle(slug);
  const apiRecipe = useMemo(() => {
    const data = articleQuery.data as BackendArticle | undefined;
    return data ? toRecipe(data, t) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleQuery.data]);

  if (articleQuery.isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <p className="text-[14px] text-[var(--color-text-muted)]">{t("recipeList.loading")}</p>
      </main>
    );
  }

  if (!apiRecipe) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <div>
          <h1 className="text-[28px] font-bold">{t("recipeList.notFoundTitle")}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            {t("recipeList.notFoundDesc")}
          </p>
          <Link to="/recettes-sante" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white">
            {t("recipeList.backToRecipes")}
          </Link>
        </div>
      </main>
    );
  }

  const recipe = apiRecipe;

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative min-h-[420px] bg-[var(--brand-primary-dark)] text-white">
        <img src={recipe.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative container-iwosan py-14">
          <Link to="/recettes-sante" className="text-[13px] font-semibold text-[var(--brand-gold)]">{t("recipeList.backToRecipes")}</Link>
          <h1 className="mt-5 max-w-4xl text-[36px] text-white md:text-[54px]">{recipe.title}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{recipe.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-[13px] text-white/80">
            <span className="rounded-full bg-white/15 px-3 py-1">{themeKeys[recipe.type] ? t(themeKeys[recipe.type]) : recipe.type}</span>
            <span>{difficultyKeys[recipe.difficulty] ? t(difficultyKeys[recipe.difficulty]) : recipe.difficulty}</span>
            <span className="inline-flex items-center gap-1"><Clock size={14} /> {recipe.prepTime}</span>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">{t("recipeList.ingredients")}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {recipe.ingredients.map((item) => (
                <li key={item} className="rounded-lg bg-[var(--brand-surface-alt)] px-4 py-3 text-[14px]">{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">{t("recipeList.steps")}</h2>
            <ol className="mt-4 space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-[12px] font-bold text-white">{index + 1}</span>
                  <span className="pt-1 text-[var(--color-text-secondary)]">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-red-900">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><AlertTriangle size={20} /> {t("recipeList.cautionNotes")}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px]">
              {recipe.cautions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[18px] font-bold"><Leaf size={18} /> {t("recipeList.associatedPlants")}</h2>
          <div className="mt-4 space-y-2">
            {recipe.plants.map((plant) => (
              <Link key={plant.slug} to="/pharmacopee/$slug" params={{ slug: plant.slug }} className="block rounded-lg bg-[var(--brand-primary-subtle)] px-4 py-3 text-[13px] font-semibold text-[var(--brand-primary)]">
                {plant.name}
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
