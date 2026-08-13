import { createFileRoute } from "@tanstack/react-router";
import { Grid2X2, Map as MapIcon, Navigation } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/shared/HeroSection";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { ProfessionalCardSkeleton } from "@/components/shared/ProfessionalCardSkeleton";
import { LeafletMap, type MapMarker } from "@/components/shared/LeafletMap";
import { AdSlot } from "@/components/shared/AdSlot";
import { professionals as fallbackProfessionals } from "@/data/professionals";
import type { Professional } from "@/types";
import { getProfessionals } from "@/lib/api/catalog";

export const Route = createFileRoute("/annuaire/")({
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
  const { t } = useTranslation();
  const [items, setItems] = useState<Professional[]>(fallbackProfessionals);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  const findNearby = () => {
    if (!navigator.geolocation) {
      setLocationMessage(t("annuaire.results.geoUnavailable"));
      return;
    }
    setLocationMessage(t("annuaire.results.geoSearching"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationMessage("");
      },
      () => setLocationMessage(t("annuaire.results.geoDenied")),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (verifiedOnly) params.set("verified", "true");
    if (userPosition) {
      params.set("sort", "distance");
      params.set("lat", String(userPosition.lat));
      params.set("lng", String(userPosition.lng));
    }
    params.set("limit", "24");
    return params;
  }, [search, verifiedOnly, userPosition]);

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

  const mapMarkers = useMemo<MapMarker[]>(
    () =>
      filteredItems
        .filter((professional): professional is Professional & { latitude: number; longitude: number } =>
          typeof professional.latitude === "number" && typeof professional.longitude === "number",
        )
        .map((professional) => ({
          id: professional.id,
          lat: professional.latitude,
          lng: professional.longitude,
          label: professional.name,
          href: `/pro/${professional.id}`,
        })),
    [filteredItems],
  );

  const hasActiveFilters = Boolean(search || specialty || country || verifiedOnly || userPosition);

  const resetFilters = () => {
    setSearch("");
    setSpecialty("");
    setCountry("");
    setVerifiedOnly(false);
    setUserPosition(null);
    setLocationMessage("");
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
          setError(t("annuaire.results.apiUnavailable"));
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
        badge={t("annuaire.hero.badge")}
        title={t("annuaire.hero.title")}
        subtitle={t("annuaire.hero.subtitle")}
        size="md"
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.directory") }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder={t("annuaire.hero.searchPlaceholder")} value={search} onChange={setSearch} />
        </div>
      </HeroSection>

      <section data-filter-panel className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-[var(--brand-border-light)] py-4">
        <div className="container-iwosan flex items-center gap-3 flex-wrap">
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="px-4 h-10 rounded-full text-[13px] font-semibold border border-[var(--brand-border)] text-[var(--color-text-secondary)] bg-white"
          >
            <option value="">{t("annuaire.filters.allSpecialties")}</option>
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
            <option value="">{t("annuaire.filters.allCountries")}</option>
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
            {t("annuaire.filters.verifiedOnly")}
          </button>
          <button
            type="button"
            onClick={findNearby}
            className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold border ${userPosition ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)] text-[var(--color-text-secondary)]"}`}
          >
            <Navigation size={14} /> {t("annuaire.filters.nearby")}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]"
            >
              {t("annuaire.filters.reset")}
            </button>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-text-primary)]">
                {isLoading
                  ? t("annuaire.results.loading")
                  : hasActiveFilters
                    ? t("annuaire.results.countMatching", { count: filteredItems.length })
                    : t("annuaire.results.countAvailable", { count: filteredItems.length })}
              </span>
            </p>
            <div className="flex gap-1 rounded-full border border-[var(--brand-border)] bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold ${viewMode === "grid" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
              >
                <Grid2X2 size={14} /> {t("annuaire.results.list")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold ${viewMode === "map" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
              >
                <MapIcon size={14} /> {t("annuaire.results.map")}
              </button>
            </div>
          </div>
          {error && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              {error}
            </p>
          )}
          {locationMessage && (
            <p className="mb-4 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
              {locationMessage}
            </p>
          )}
          <AdSlot position="annuaire_top" className="mb-6" />
          {viewMode === "map" ? (
            mapMarkers.length > 0 ? (
              <LeafletMap markers={mapMarkers} heightClassName="h-[520px]" />
            ) : (
              <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
                {t("annuaire.results.noLocation")}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => <ProfessionalCardSkeleton key={index} />)
                : filteredItems.map((professional, index) => (
                    <Reveal key={professional.id} delayMs={staggerDelay(index % 12)}>
                      <ProfessionalCard pro={professional} />
                    </Reveal>
                  ))}
            </div>
          )}
          {viewMode === "grid" && !isLoading && filteredItems.length === 0 && (
            <div className="mt-6 rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <p className="font-bold">{t("annuaire.results.notFound")}</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
              >
                {t("annuaire.results.clearFilters")}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}