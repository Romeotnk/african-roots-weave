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
  { label: "Gyneco-obstetriques", value: "GYNECO_OBSTETRIQUE", match: ["gyn"] },
  { label: "Gastro-intestinales", value: "GASTRO_INTESTINAL", match: ["gastro"] },
  { label: "Maladies de l'enfance", value: "MALADIES_ENFANCE", match: ["enfan"] },
  { label: "Etats febriles/Icteres", value: "ETATS_FEBRILES_ICTERES", match: ["febril", "icter"] },
  { label: "Affections cutanees", value: "AFFECTIONS_CUTANEES", match: ["cutan"] },
  { label: "Systeme nerveux", value: "SYSTEME_NERVEUX", match: ["nerveu"] },
  { label: "Osteo-articulaire", value: "OSTEO_ARTICULAIRE", match: ["osteo", "articul"] },
  { label: "Pulmonaire", value: "PULMONAIRE", match: ["pulmon"] },
  { label: "Uro-genital", value: "URO_GENITAL", match: ["uro", "genit"] },
  { label: "ORL", value: "ORL", match: ["orl"] },
  { label: "Ophtalmologique", value: "OPHTALMOLOGIQUE", match: ["ophta"] },
  { label: "Bucco-dentaire", value: "BUCCO_DENTAIRE", match: ["bucco", "dentai"] },
  { label: "Cardio-vasculaire", value: "CARDIO_VASCULAIRE", match: ["cardio", "vascu"] },
  { label: "Stomatologique", value: "STOMATOLOGIQUE", match: ["stomato"] },
  { label: "Mystique", value: "MYSTIQUE", match: ["mystiq"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Marketplace() {
  const [items, setItems] = useState<Product[]>(fallbackProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    params.set("limit", "48");
    return params;
  }, [category, type, sort, search]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getProducts(query)
      .then(({ products }) => {
        if (!cancelled && products.length) setItems(products);
      })
      .catch(() => {
        if (!cancelled) setItems(fallbackProducts);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (search) {
      const q = normalize(search);
      list = list.filter((p) =>
        [p.title, p.category, p.sellerName].some((field) => normalize(field ?? "").includes(q)),
      );
    }
    if (category) {
      const cat = categories.find((c) => c.value === category);
      if (cat) {
        list = list.filter((p) => {
          const cn = normalize(p.category);
          return cat.match.some((m) => cn.includes(m));
        });
      }
    }
    if (type) {
      const map = { PHYSICAL: "physical", SERVICE: "service", DIGITAL: "digital" } as const;
      const tt = map[type as keyof typeof map];
      list = list.filter((p) => p.type === tt);
    }
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [items, search, category, type, sort]);

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
          <SearchBar
            placeholder="Plante, produit, vendeur..."
            value={search}
            onChange={setSearch}
          />
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
                  setSearch("");
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
                <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === ""}
                    onChange={() => setCategory("")}
                    className="accent-[var(--brand-primary)]"
                  />
                  <span className="flex-1 text-[var(--color-text-secondary)]">Toutes</span>
                </label>
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
                  <label key={value} className="flex items-center gap-2 text-[13px] cursor-pointer">
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
                  {isLoading ? "Chargement..." : `${filtered.length} resultats`}
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
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[var(--brand-border)] px-4 py-8 text-center text-[14px] text-[var(--color-text-muted)]">
                Aucun resultat pour ces filtres. Essayez de reinitialiser.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
