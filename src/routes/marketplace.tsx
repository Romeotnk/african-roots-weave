import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProductCard } from "@/components/shared/ProductCard";
import { products } from "@/data/products";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — IWOSAN" },
      {
        name: "description",
        content:
          "Produits, services et ressources numériques de la médecine traditionnelle africaine.",
      },
    ],
  }),
  component: Marketplace,
});

const categories = [
  "Gynéco-obstétriques",
  "Gastro-intestinales",
  "Maladies de l'enfance",
  "États fébriles/Ictères",
  "Affections cutanées",
  "Affections du système nerveux",
  "Affections ostéo-articulaires",
  "Affections pulmonaires",
  "Affections uro-génitales",
  "Affections ORL",
  "Affections ophtalmologiques",
  "Affections bucco-dentaires",
  "Affections cardio-vasculaires",
  "Affections stomatologiques",
  "Affections mystiques",
];

function Marketplace() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge="🛍️ Marketplace"
        title="Marketplace Iwosan"
        subtitle="Produits, services et ressources numériques de la médecine traditionnelle africaine — vérifiés par notre équipe."
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
              <button className="text-[12px] text-[var(--brand-primary)] font-semibold">
                Réinitialiser
              </button>
            </div>
            <details open className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Catégorie <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-2">
                {categories.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" className="accent-[var(--brand-primary)]" />
                    <span className="flex-1 text-[var(--color-text-secondary)]">{c}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {Math.floor(Math.random() * 90) + 10}
                    </span>
                  </label>
                ))}
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Type <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2">
                {["Tous", "Produit physique", "Service", "Produit numérique"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-[13px]">
                    <input type="radio" name="type" className="accent-[var(--brand-primary)]" /> {t}
                  </label>
                ))}
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Évaluation <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2">
                {["4★ et plus", "3★ et plus", "Tous"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-[13px]">
                    <input type="radio" name="rating" className="accent-[var(--brand-primary)]" />{" "}
                    {t}
                  </label>
                ))}
              </div>
            </details>
            <label className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--brand-border-light)] text-[13px] font-semibold">
              Vendeur vérifié uniquement
              <input type="checkbox" className="accent-[var(--brand-primary)] w-5 h-5" />
            </label>
            <button className="mt-6 w-full h-11 rounded-full bg-[var(--brand-primary)] text-white font-semibold">
              Appliquer les filtres
            </button>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <span className="font-bold text-[var(--color-text-primary)]">542 résultats</span>
              </p>
              <select className="h-10 px-4 rounded-full border border-[var(--brand-border)] text-[13px] bg-white">
                <option>Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Les mieux notés</option>
                <option>Les plus récents</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-12 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-10 h-10 rounded-full text-[14px] font-semibold ${n === 1 ? "bg-[var(--brand-primary)] text-white" : "hover:bg-[var(--brand-surface-alt)]"}`}
                >
                  {n}
                </button>
              ))}
              <button className="w-10 h-10 rounded-full hover:bg-[var(--brand-surface-alt)]">
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
