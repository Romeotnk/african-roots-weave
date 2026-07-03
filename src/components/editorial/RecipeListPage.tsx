import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChefHat, Clock, Coffee, Leaf, Soup } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { recipes } from "@/data/recipes";
import { useDebounce } from "@/hooks/useDebounce";

const themes = [
  { name: "Infusion", icon: Coffee, color: "bg-amber-50 text-amber-700" },
  { name: "Decoction", icon: Soup, color: "bg-orange-50 text-orange-700" },
  { name: "Cataplasme", icon: Leaf, color: "bg-green-50 text-green-700" },
  { name: "Preparation culinaire", icon: ChefHat, color: "bg-rose-50 text-rose-700" },
];

export function RecipeListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);

  const filteredRecipes = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const searchable = [recipe.title, recipe.excerpt, recipe.type, recipe.difficulty, ...recipe.ingredients, ...recipe.plants.map((plant) => plant.name)]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalized || searchable.includes(normalized);
      const matchesType = type === "Toutes" || recipe.type === type;
      return matchesSearch && matchesType;
    });
  }, [debouncedSearch, type]);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge="Recettes"
        title="Recettes Sante"
        subtitle="Preparations traditionnelles documentees pas a pas, avec dosages, indications et precautions."
        size="md"
      >
        <div className="mx-auto max-w-2xl">
          <SearchBar placeholder="Recette, plante, indication..." value={search} onChange={setSearch} showFilters={false} />
        </div>
      </HeroSection>

      <section className="py-16">
        <div className="container-iwosan">
          <h2 className="mb-8 text-[28px]">Parcourir par theme</h2>
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setType((current) => (current === theme.name ? "Toutes" : theme.name))}
                className={`rounded-[12px] border p-6 text-left transition ${
                  type === theme.name ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border-light)] bg-white"
                }`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${theme.color}`}>
                  <theme.icon size={22} />
                </div>
                <h3 className="text-[16px] font-bold">{theme.name}</h3>
                <p className="mt-1 text-[12px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  {recipes.filter((recipe) => recipe.type === theme.name).length} recettes
                </p>
              </button>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text-primary)]">{filteredRecipes.length}</strong> recettes
                {debouncedSearch ? ` pour "${debouncedSearch}"` : ""}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredRecipes.map((recipe) => (
                  <article key={recipe.id} className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
                    <img src={recipe.image} alt={recipe.title} className="h-48 w-full object-cover" />
                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
                        <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 font-semibold text-[var(--brand-primary)]">{recipe.type}</span>
                        <span>{recipe.difficulty}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {recipe.prepTime}</span>
                      </div>
                      <h3 className="text-[18px] font-bold">{recipe.title}</h3>
                      <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{recipe.excerpt}</p>
                      <Link to="/recettes/$slug" params={{ slug: recipe.slug }} className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
                        Voir la recette
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <aside className="h-fit rounded-[12px] bg-[var(--brand-primary)] p-6 text-white">
              <h3 className="mb-2 text-[18px] font-bold">Besoin d'aide ?</h3>
              <p className="mb-5 text-[14px] leading-[1.6] text-white/80">
                Un doute sur une posologie, une plante, une indication ? Notre equipe repond sous 24h.
              </p>
              <Link to="/aide" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-gold)] font-semibold text-[var(--color-text-primary)]">
                Ouvrir un ticket
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
