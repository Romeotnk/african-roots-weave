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

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Annuaire() {
  const [items, setItems] = useState<Professional[]>(fallbackProfessionals);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [country, setCountry] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (verifiedOnly) params.set("verified", "true");
    params.set("limit", "48");
    return params;
  }, [search, verifiedOnly]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getProfessionals(query)
      .then(({ professionals }) => {
        if (!cancelled && professionals.length) setItems(professionals);
      })
      .catch(() => {
        if (!cancelled) setItems(fallbackProfessionals);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const countries = useMemo(
    () => Array.from(new Set(items.map((p) => p.country).filter(Boolean))).sort(),
    [items],
  );
  const specialties = useMemo(
    () =>
      Array.from(new Set(items.flatMap((p) => p.specialties ?? []).filter(Boolean))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (verifiedOnly && !p.verified) return false;
      if (country && p.country !== country) return false;
      if (specialty && !(p.specialties ?? []).includes(specialty)) return false;
      if (search) {
        const q = normalize(search);
        const haystack = normalize(
          [p.name, p.specialty, p.location, p.country, p.bio, ...(p.specialties ?? [])].join(" "),
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, verifiedOnly, country, specialty]);

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
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] bg-white text-[var(--color-text-secondary)]"
          >
            <option value="">Toutes specialites</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] bg-white text-[var(--color-text-secondary)]"
          >
            <option value="">Tous pays</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setVerifiedOnly((value) => !value)}
            className={`px-4 h-10 rounded-full text-[13px] font-semibold border ${verifiedOnly ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)] text-[var(--color-text-secondary)]"}`}
          >
            Verifie uniquement
          </button>
          {(search || verifiedOnly || country || specialty) && (
            <button
              onClick={() => {
                setSearch("");
                setVerifiedOnly(false);
                setCountry("");
                setSpecialty("");
              }}
              className="px-4 h-10 rounded-full text-[13px] font-semibold text-[var(--brand-primary)]"
            >
              Reinitialiser
            </button>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-text-primary)]">
                {isLoading ? "Chargement..." : `${filtered.length} praticiens`}
              </span>
            </p>
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--brand-border)] px-4 py-8 text-center text-[14px] text-[var(--color-text-muted)]">
              Aucun praticien ne correspond a votre recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((professional) => (
                <ProfessionalCard key={professional.id} pro={professional} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
