import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { professionals as fallbackProfessionals } from "@/data/professionals";
import type { Professional } from "@/types";
import { getProfessionals } from "@/lib/api/catalog";

export const Route = createFileRoute("/annuaire")({
  head: () => ({
    meta: [
      { title: "Annuaire des praticiens - IWOSAN" },
      {
        name: "description",
        content:
          "Decouvrez nos praticiens traditionnels verifies, documentes et evalues par la communaute.",
      },
    ],
  }),
  component: Annuaire,
});

function Annuaire() {
  const [items, setItems] = useState<Professional[]>(fallbackProfessionals);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (verifiedOnly) params.set("verified", "true");
    params.set("limit", "24");
    return params;
  }, [search, verifiedOnly]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getProfessionals(query)
      .then(({ professionals }) => {
        if (!cancelled) setItems(professionals);
      })
      .catch((apiError) => {
        if (!cancelled) {
          setError(apiError instanceof Error ? apiError.message : "API indisponible, donnees locales affichees.");
          setItems(fallbackProfessionals);
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
        image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&q=80"
        badge="Annuaire"
        title="Annuaire des Praticiens"
        subtitle="Praticiens, specialites et localisations verifies par notre equipe editoriale."
        size="md"
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Annuaire" }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Nom, specialite, localisation..." value={search} onChange={setSearch} />
        </div>
      </HeroSection>

      <section className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-[var(--brand-border-light)] py-4">
        <div className="container-iwosan flex items-center gap-3 flex-wrap">
          <button className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] text-[var(--color-text-secondary)]">
            Toutes specialites
          </button>
          <button className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] text-[var(--color-text-secondary)]">
            Tous pays
          </button>
          <button
            onClick={() => setVerifiedOnly((value) => !value)}
            className={`px-4 h-10 rounded-full text-[13px] font-semibold border ${verifiedOnly ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)] text-[var(--color-text-secondary)]"}`}
          >
            Verifie uniquement
          </button>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-text-primary)]">
                {isLoading ? "Chargement..." : `${items.length} praticiens`}
              </span>
            </p>
          </div>
          {error && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((professional) => (
              <ProfessionalCard key={professional.id} pro={professional} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
