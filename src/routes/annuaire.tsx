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
          "Decouvrez nos praticiens traditionnels vérifiés, documentés et évalués par la communaute.",
      },
    ],
  }),
  component: Annuaire,
});

function Annuaire() {
  const [items, setItems] = useState<Professional[]>(fallbackProfessionals);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (verifiedOnly) params.set("verified", "true");
    params.set("limit", "24");
    return params;
  }, [search, verifiedOnly]);

  const specialties = useMemo(
    () =>
      Array.from(new Set(items.flatMap((professional) => professional.specialties))).sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [items],
  );

  const countries = useMemo(
    () => Array.from(new Set(items.map((professional) => professional.country))).sort((a, b) => a.localeCompare(b, "fr")),
    [items],
  );

  const filteredItems = useMemo(
    () => {
      const normalizedSearch = search.trim().toLowerCase();
      return items.filter((professional) => {
        const searchableText = [
          professional.name,
          professional.specialty,
          professional.location,
          professional.country,
          professional.bio,
          ...professional.specialties,
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
        const matchesSpecialty = !specialty || professional.specialties.includes(specialty);
        const matchesCountry = !country || professional.country === country;
        const matchesVerified = !verifiedOnly || professional.verified;
        return matchesSearch && matchesSpecialty && matchesCountry && matchesVerified;
      });
    },
    [country, items, search, specialty, verifiedOnly],
  );

  const hasActiveFilters = Boolean(search || specialty || country || verifiedOnly);

  const resetFilters = () => {
    setSearch("");
    setSpecialty("");
    setCountry("");
    setVerifiedOnly(false);
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getProfessionals(query)
      .then(({ professionals }) => {
        if (!cancelled) setItems(professionals);
      })
      .catch(() => {
        if (!cancelled) {
          setError("API indisponible, données locales affichées.");
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
        title="Annuaire des praticiens"
        subtitle="Praticiens, spécialités et localisations vérifiés par notre équipe éditoriale."
        size="md"
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Annuaire" }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Nom, spécialité, localisation..." value={search} onChange={setSearch} />
        </div>
      </HeroSection>

      <section data-filter-panel className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-[var(--brand-border-light)] py-4">
        <div className="container-iwosan flex items-center gap-3 flex-wrap">
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] text-[var(--color-text-secondary)] bg-white"
          >
            <option value="">Toutes spécialités</option>
            {specialties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] text-[var(--color-text-secondary)] bg-white"
          >
            <option value="">Tous pays</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setVerifiedOnly((value) => !value)}
            className={`px-4 h-10 rounded-full text-[13px] font-semibold border ${verifiedOnly ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)] text-[var(--color-text-secondary)]"}`}
          >
            Vérifiés uniquement
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-text-primary)]">
                {isLoading ? "Chargement..." : `${filteredItems.length} praticiens`}
              </span>
              {hasActiveFilters && !isLoading ? " correspondent à vos filtres" : " disponibles"}
            </p>
          </div>
          {error && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((professional) => (
              <ProfessionalCard key={professional.id} pro={professional} />
            ))}
          </div>
          {!isLoading && filteredItems.length === 0 && (
            <div className="mt-6 rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <p className="font-bold">Aucun praticien trouvé</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}