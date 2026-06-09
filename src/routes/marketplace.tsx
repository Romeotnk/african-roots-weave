import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProductCard } from "@/components/shared/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/types";
import { getProducts } from "@/lib/api/catalog";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace - IWOSAN" },
      {
        name: "description",
        content:
          "Produits, services et ressources numeriques de la medecine traditionnelle africaine.",
      },
    ],
  }),
  component: Marketplace,
});

const categories = [
  { label: "Gyneco-obstetriques", value: "GYNECO_OBSTETRIQUE" },
  { label: "Gastro-intestinales", value: "GASTRO_INTESTINAL" },
  { label: "Maladies de l'enfance", value: "MALADIES_ENFANCE" },
  { label: "Etats febriles/Icteres", value: "ETATS_FEBRILES_ICTERES" },
  { label: "Affections cutanees", value: "AFFECTIONS_CUTANEES" },
  { label: "Systeme nerveux", value: "SYSTEME_NERVEUX" },
  { label: "Osteo-articulaire", value: "OSTEO_ARTICULAIRE" },
  { label: "Pulmonaire", value: "PULMONAIRE" },
  { label: "Uro-genital", value: "URO_GENITAL" },
  { label: "ORL", value: "ORL" },
  { label: "Ophtalmologique", value: "OPHTALMOLOGIQUE" },
  { label: "Bucco-dentaire", value: "BUCCO_DENTAIRE" },
  { label: "Cardio-vasculaire", value: "CARDIO_VASCULAIRE" },
  { label: "Stomatologique", value: "STOMATOLOGIQUE" },
  { label: "Mystique", value: "MYSTIQUE" },
];

function Marketplace() {
  const [items, setItems] = useState<Product[]>(fallbackProducts);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    params.set("limit", "24");
    return params;
  }, [category, type, sort]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getProducts(query)
      .then(({ products }) => {
        if (!cancelled) setItems(products);
      })
      .catch((apiError) => {
        if (!cancelled) {
          setError(apiError instanceof Error ? apiError.message : "API indisponible, donnees locales affichees.");
          setItems(fallbackProducts);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge="Marketplace"
        title="Marketplace Iwosan"
        subtitle="Produits, services et ressources numeriques de la medecine traditionnelle africaine - verifies par notre equipe."
        size="md"
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Marketplace" }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Plante, produit, vendeur..." />
        </div>
      </HeroSection>

      <section className="py-12">
        <div className="container-iwosan grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6 h-fit sticky top-[88px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[16px]">Filtres</h3>
              <button
                onClick={() => {
                  setCategory("");
                  setType("");
                  setSort("newest");
                }}
                className="text-[12px] text-[var(--brand-primary)] font-semibold"
              >
                Reinitialiser
              </button>
            </div>
            <details open className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Categorie <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-2">
                {categories.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={category === item.value}
                      onChange={() => setCategory(item.value)}
                      className="accent-[var(--brand-primary)]"
                    />
                    <span className="flex-1 text-[var(--color-text-secondary)]">{item.label}</span>
                  </label>
                ))}
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Type <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2">
                {[
                  ["", "Tous"],
                  ["PHYSICAL", "Produit physique"],
                  ["SERVICE", "Service"],
                  ["DIGITAL", "Produit numerique"],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="radio"
                      name="type"
                      checked={type === value}
                      onChange={() => setType(value)}
                      className="accent-[var(--brand-primary)]"
                    />{" "}
                    {label}
                  </label>
                ))}
              </div>
            </details>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <span className="font-bold text-[var(--color-text-primary)]">
                  {isLoading ? "Chargement..." : `${items.length} resultats`}
                </span>
              </p>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 px-4 rounded-full border border-[var(--brand-border)] text-[13px] bg-white"
              >
                <option value="newest">Les plus recents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix decroissant</option>
                <option value="rating">Les mieux notes</option>
              </select>
            </div>
            {error && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                {error}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
