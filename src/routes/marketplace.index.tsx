import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, Grid2X2, List, Map as MapIcon, MapPin, Navigation, Star, X } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/shared/RatingStars";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/types";
import { getProducts } from "@/lib/api/catalog";
import { AdSlot } from "@/components/shared/AdSlot";
import { LeafletMap, type MapMarker } from "@/components/shared/LeafletMap";
import { useDebounce } from "@/hooks/useDebounce";
import { useSavedSearchActions } from "@/hooks/useSavedSearchesApi";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace - IWOSAN" },
      {
        name: "description",
        content:
          "Produits, services et ressources numériques de la médecine traditionnelle africaine.",
      },
    ],
  }),
  component: Marketplace,
});

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

function Marketplace() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Product[]>(fallbackProducts);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Product["type"][]>([]);
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [distance, setDistance] = useState([120]);
  const [dateFilter, setDateFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [alertError, setAlertError] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");
  const { user } = useAuth();
  const savedSearchActions = useSavedSearchActions();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (selectedTypes[0]) params.set("type", selectedTypes[0]);
    if (sort) params.set("sort", sort);
    // Distance sort needs the real global ranking from the backend — without
    // this, "closest to me" only re-sorted whichever 24 items the default
    // sort happened to fetch, which could miss genuinely closer listings.
    if (sort === "distance" && userPosition) {
      params.set("lat", String(userPosition.lat));
      params.set("lng", String(userPosition.lng));
    }
    params.set("limit", "24");
    return params;
  }, [selectedCategories, selectedTypes, sort, userPosition]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((product) => counts.set(product.category, (counts.get(product.category) ?? 0) + 1));
    return counts;
  }, [items]);
  // Backward-compat shape for the active-filter chips, which just need value+label.
  const categories = useMemo(
    () =>
      [...categoryCounts.entries()].map(([value, count]) => {
        const match = items.find((product) => product.category === value);
        return { value, count, label: match?.categoryLabel ?? value };
      }),
    [categoryCounts, items],
  );

  const categoryTaxonomyQuery = useTaxonomy("PRODUCT_CATEGORY");
  const categoryTree = useMemo(() => {
    const all = categoryTaxonomyQuery.data ?? [];
    return all
      .filter((item) => !item.parentId)
      .map((parent) => ({ ...parent, children: all.filter((child) => child.parentId === parent.id) }));
  }, [categoryTaxonomyQuery.data]);

  const countries = useMemo(
    () => Array.from(new Set(items.map((product) => product.country).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), "fr")),
    [items],
  );

  const activeFilterSummary = useMemo(() => {
    const parts = [
      debouncedSearch && t("marketplace.activeFilters.searchLabel", { query: debouncedSearch }),
      selectedCategories.length > 0 &&
        t("marketplace.activeFilters.categoryCount", { count: selectedCategories.length }),
      selectedTypes.length > 0 && t("marketplace.activeFilters.typeCount", { count: selectedTypes.length }),
      (priceMin || priceMax || priceRange[0] > 0 || priceRange[1] < 50000) &&
        t("marketplace.activeFilters.priceRange", { min: priceMin || priceRange[0], max: priceMax || priceRange[1] }),
      country && t("marketplace.activeFilters.countryLabel", { country }),
      city && t("marketplace.activeFilters.cityLabel", { city }),
      minRating > 0 && t("marketplace.activeFilters.ratingLabel", { rating: minRating }),
      verifiedOnly && t("marketplace.activeFilters.verifiedSellers"),
    ].filter(Boolean);
    return parts.join(", ") || t("marketplace.activeFilters.defaultSummary");
  }, [
    city,
    country,
    debouncedSearch,
    minRating,
    priceMax,
    priceMin,
    priceRange,
    selectedCategories,
    selectedTypes,
    t,
    verifiedOnly,
  ]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    const min = priceMin === "" ? priceRange[0] : Number(priceMin);
    const max = priceMax === "" ? priceRange[1] : Number(priceMax);
    const now = Date.now();

    const filtered = items.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.title, product.categoryLabel ?? product.category, product.sellerName, product.type, product.location, product.country]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const matchesPrice = product.price >= min && product.price <= max;
      const matchesCountry = !country || product.country === country;
      const matchesCity = !city || product.location?.toLowerCase().includes(city.toLowerCase());
      const createdAt = product.createdAt ? new Date(product.createdAt).getTime() : now;
      const matchesDate =
        dateFilter === "today"
          ? now - createdAt <= 24 * 60 * 60 * 1000
          : dateFilter === "week"
            ? now - createdAt <= 7 * 24 * 60 * 60 * 1000
            : dateFilter === "month"
              ? now - createdAt <= 31 * 24 * 60 * 60 * 1000
              : true;
      const matchesRating = product.rating >= minRating;
      const matchesVerified = !verifiedOnly || Boolean(product.verified);
      const matchesDistance =
        !userPosition || !product.coordinates || distanceKm(userPosition, product.coordinates) <= distance[0];
      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesCountry &&
        matchesCity &&
        matchesDate &&
        matchesRating &&
        matchesVerified &&
        matchesDistance
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "distance": {
          if (!userPosition) return 0;
          const distanceA = a.coordinates ? distanceKm(userPosition, a.coordinates) : Infinity;
          const distanceB = b.coordinates ? distanceKm(userPosition, b.coordinates) : Infinity;
          return distanceA - distanceB;
        }
        case "popular":
          return (b.popularity ?? 0) - (a.popularity ?? 0);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "relevance":
          return (b.verified ? 10 : 0) + b.rating - ((a.verified ? 10 : 0) + a.rating);
        case "newest":
        default:
          return new Date(b.createdAt ?? "2026-01-01").getTime() - new Date(a.createdAt ?? "2026-01-01").getTime();
      }
    });
  }, [
    city,
    country,
    dateFilter,
    debouncedSearch,
    distance,
    items,
    minRating,
    priceMax,
    priceMin,
    priceRange,
    selectedCategories,
    selectedTypes,
    sort,
    userPosition,
    verifiedOnly,
  ]);

  const mapMarkers = useMemo<MapMarker[]>(
    () =>
      filteredItems
        .filter((product): product is Product & { coordinates: { lat: number; lng: number } } => Boolean(product.coordinates))
        .map((product) => ({
          id: product.id,
          lat: product.coordinates.lat,
          lng: product.coordinates.lng,
          label: `${product.title} — ${product.price.toLocaleString("fr-FR")} ${product.currency}`,
          href: `/marketplace?produit=${product.id}`,
        })),
    [filteredItems],
  );

  const activeFilterCount = [
    selectedCategories.length,
    selectedTypes.length,
    priceMin || priceMax || priceRange[0] > 0 || priceRange[1] < 50000,
    debouncedSearch,
    country,
    city,
    dateFilter !== "all",
    minRating,
    verifiedOnly,
  ].filter(Boolean).length;
  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceMin("");
    setPriceMax("");
    setPriceRange([0, 50000]);
    setCountry("");
    setCity("");
    setDistance([120]);
    setDateFilter("all");
    setMinRating(0);
    setVerifiedOnly(false);
    setSort("newest");
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const toggleCategoryGroup = (childSlugs: string[]) => {
    const allSelected = childSlugs.every((slug) => selectedCategories.includes(slug));
    setSelectedCategories((current) =>
      allSelected ? current.filter((slug) => !childSlugs.includes(slug)) : [...new Set([...current, ...childSlugs])],
    );
  };

  const toggleType = (value: Product["type"]) => {
    setSelectedTypes((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };


  const activateGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationMessage(t("marketplace.filters.geoUnavailable"));
      return;
    }

    setLocationMessage(t("marketplace.filters.geoSearching"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setSort("distance");
        setLocationMessage(t("marketplace.filters.geoFound"));
      },
      () => setLocationMessage(t("marketplace.filters.geoDenied")),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };
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
          setError(apiError instanceof Error ? apiError.message : t("marketplace.results.apiUnavailable"));
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

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") return;
    const sharedProductId = new URLSearchParams(window.location.search).get("produit");
    if (!sharedProductId) return;
    const shared = items.find((product) => product.id === sharedProductId);
    if (shared) setSelectedProduct(shared);
  }, [items]);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge={t("marketplace.hero.badge")}
        title={t("marketplace.hero.title")}
        subtitle={t("marketplace.hero.subtitle")}
        size="md"
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.marketplace") }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder={t("marketplace.hero.searchPlaceholder")} value={search} onChange={setSearch} />
        </div>
      </HeroSection>

      <section className="py-12">
        <div className="container-iwosan grid lg:grid-cols-[280px_1fr] gap-8">
          <aside data-filter-panel className="hidden lg:block bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6 h-fit sticky top-[88px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[16px]">{t("marketplace.filters.title")}</h3>
              <button
                onClick={resetFilters}
                className="text-[12px] text-[var(--brand-primary)] font-semibold"
              >
                {t("marketplace.filters.reset")} {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
            </div>
            <AdSlot position="marketplace_sidebar" className="mb-4" />
            <details open className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                {t("marketplace.filters.category")} <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-2">
                {categoryTree.map((parent) => {
                  const childSlugs = parent.children.map((child) => child.slug);
                  const groupCount = childSlugs.reduce((sum, slug) => sum + (categoryCounts.get(slug) ?? 0), 0);
                  return (
                    <div key={parent.id}>
                      <label className="flex items-center gap-2 text-[13px] font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={childSlugs.length > 0 && childSlugs.every((slug) => selectedCategories.includes(slug))}
                          onChange={() => toggleCategoryGroup(childSlugs)}
                          className="accent-[var(--brand-primary)]"
                        />
                        <span className="flex-1 text-[var(--color-text-primary)]">{parent.name}</span>
                        <span className="text-[11px] font-normal text-[var(--color-text-muted)]">{groupCount}</span>
                      </label>
                      <div className="mt-1.5 ml-5 space-y-1.5">
                        {parent.children.map((child) => (
                          <label key={child.id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(child.slug)}
                              onChange={() => toggleCategory(child.slug)}
                              className="accent-[var(--brand-primary)]"
                            />
                            <span className="flex-1 text-[var(--color-text-secondary)]">{child.name}</span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">{categoryCounts.get(child.slug) ?? 0}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                {t("marketplace.filters.type")} <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-2">
                {[
                  ["physical", t("marketplace.filters.typePhysical")],
                  ["service", t("marketplace.filters.typeService")],
                  ["digital", t("marketplace.filters.typeDigital")],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(value as Product["type"])}
                      onChange={() => toggleType(value as Product["type"])}
                      className="accent-[var(--brand-primary)]"
                    />{" "}
                    {label}
                  </label>
                ))}
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                {t("marketplace.filters.price")} <ChevronDown size={14} />
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="col-span-2 px-1">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={50000}
                    step={1000}
                    onValueChange={setPriceRange}
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-[var(--color-text-muted)]">
                    <span>{priceRange[0].toLocaleString("fr-FR")} FCFA</span>
                    <span>{priceRange[1].toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  placeholder={t("marketplace.filters.pricePlaceholderMin")}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
                <input
                  type="number"
                  min="0"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  placeholder={t("marketplace.filters.pricePlaceholderMax")}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                {t("marketplace.filters.location")} <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-3">
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 text-[13px]"
                >
                  <option value="">{t("marketplace.filters.allCountries")}</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder={t("marketplace.filters.cityPlaceholder")}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
                <div>
                  <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--color-text-muted)]">
                    <span>{t("marketplace.filters.distance")}</span>
                    <span>{t("marketplace.filters.distanceKm", { count: distance[0] })}</span>
                  </div>
                  <Slider value={distance} min={0} max={500} step={10} onValueChange={setDistance} />
                </div>
                <button
                  type="button"
                  onClick={activateGeolocation}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--brand-border)] text-[12px] font-semibold"
                >
                  <Navigation size={14} /> {locationMessage || t("marketplace.filters.activateGeolocation")}
                </button>
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                {t("marketplace.filters.publicationQuality")} <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-3">
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 text-[13px]"
                >
                  <option value="all">{t("marketplace.filters.allDates")}</option>
                  <option value="today">{t("marketplace.filters.today")}</option>
                  <option value="week">{t("marketplace.filters.thisWeek")}</option>
                  <option value="month">{t("marketplace.filters.thisMonth")}</option>
                </select>
                <div>
                  <p className="mb-2 text-[12px] font-semibold">{t("marketplace.filters.minRating")}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={rating <= minRating ? "text-[var(--brand-gold)]" : "text-[var(--brand-border)]"}
                        aria-label={t("marketplace.filters.ratingAriaLabel", { count: rating })}
                      >
                        <Star size={18} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  {t("marketplace.filters.verifiedOnly")} <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                </label>
              </div>
            </details>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <span className="font-bold text-[var(--color-text-primary)]">
                  {isLoading
                    ? t("marketplace.results.loading")
                    : t("marketplace.results.count", { count: filteredItems.length })}
                </span>
                {debouncedSearch && !isLoading ? t("marketplace.results.forQuery", { query: debouncedSearch }) : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAlertOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  <Bell size={15} /> {t("marketplace.results.createAlert")}
                </button>
                <Link
                  to="/marketplace/deposer"
                  className="inline-flex h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white"
                >
                  {t("marketplace.results.postListing")}
                </Link>
                <div className="inline-flex h-10 rounded-full border border-[var(--brand-border)] bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 text-[12px] font-semibold ${viewMode === "grid" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                  >
                    <Grid2X2 size={14} /> {t("marketplace.results.grid")}
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 text-[12px] font-semibold ${viewMode === "list" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                  >
                    <List size={14} /> {t("marketplace.results.list")}
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 text-[12px] font-semibold ${viewMode === "map" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                  >
                    <MapIcon size={14} /> {t("marketplace.results.map")}
                  </button>
                </div>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 px-4 rounded-full border border-[var(--brand-border)] text-[13px] bg-white"
                >
                  <option value="relevance">{t("marketplace.results.sortRelevance")}</option>
                  <option value="newest">{t("marketplace.results.sortNewest")}</option>
                  <option value="price_asc">{t("marketplace.results.sortPriceAsc")}</option>
                  <option value="price_desc">{t("marketplace.results.sortPriceDesc")}</option>
                  <option value="rating">{t("marketplace.results.sortRating")}</option>
                  <option value="popular">{t("marketplace.results.sortPopular")}</option>
                  {userPosition && <option value="distance">{t("marketplace.results.sortDistance")}</option>}
                </select>
              </div>
            </div>
            {error && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                {error}
              </p>
            )}
            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {[...selectedCategories, ...selectedTypes, debouncedSearch, country, city].filter(Boolean).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      if (selectedCategories.includes(filter)) toggleCategory(filter);
                      if (selectedTypes.includes(filter as Product["type"])) toggleType(filter as Product["type"]);
                      if (filter === debouncedSearch) setSearch("");
                      if (filter === country) setCountry("");
                      if (filter === city) setCity("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                  >
                    {categories.find((item) => item.value === filter)?.label ?? filter} <X size={12} />
                  </button>
                ))}
                {(priceMin || priceMax) && (
                  <button
                    onClick={() => {
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                  >
                    {t("marketplace.activeFilters.priceRangeChip", { min: priceMin || "0", max: priceMax || "max" })}{" "}
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)
                  : filteredItems.map((product, index) => (
                      <Reveal key={product.id} delayMs={staggerDelay(index % 9)}>
                        <ProductCard product={product} />
                      </Reveal>
                    ))}
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-[16px] border border-[var(--brand-border-light)] bg-white p-3">
                        <Skeleton className="h-20 w-24 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/5" />
                          <Skeleton className="h-3 w-2/5" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-5 w-20 shrink-0" />
                      </div>
                    ))
                  : filteredItems.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="flex w-full items-center gap-4 rounded-[16px] border border-[var(--brand-border-light)] bg-white p-3 text-left transition hover:border-[var(--brand-primary)] hover:shadow-iwosan-sm"
                      >
                        <img src={product.image} alt={product.title} loading="lazy" decoding="async" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-bold">{product.title}</p>
                          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                            {product.location ?? t("marketplace.filters.location")}
                            {product.country ? `, ${product.country}` : ""}
                          </p>
                          <div className="mt-1"><RatingStars rating={product.rating} reviewCount={product.reviewCount} /></div>
                        </div>
                        <span className="shrink-0 text-[16px] font-bold text-[var(--brand-primary)]">
                          {product.quoteOnly ? t("marketplace.results.viewAction") : `${product.price.toLocaleString("fr-FR")} ${product.currency}`}
                        </span>
                      </button>
                    ))}
              </div>
            ) : (
              <div className="grid xl:grid-cols-[1fr_340px] gap-6">
                <div className="relative">
                  {mapMarkers.length > 0 ? (
                    <LeafletMap markers={mapMarkers} heightClassName="h-[560px]" />
                  ) : (
                    <div className="flex h-[560px] items-center justify-center rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
                      {t("marketplace.results.noLocationOnMap")}
                    </div>
                  )}
                  {userPosition && (
                    <div className="absolute bottom-5 left-5 z-[1000] rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-4 py-2 text-[12px] font-semibold text-[var(--brand-primary)] shadow-iwosan-sm">
                      {t("marketplace.results.radiusSelected", { km: distance[0] })}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {filteredItems.slice(0, 5).map((product) => (
                    <article key={product.id} className="flex gap-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-3">
                      <img src={product.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-bold">{product.title}</p>
                        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                          {product.location ?? t("marketplace.filters.location")} - {product.price.toLocaleString("fr-FR")} {product.currency}
                        </p>
                        <button type="button" onClick={() => setSelectedProduct(product)} className="mt-2 h-8 rounded-full bg-[var(--brand-primary)] px-3 text-[12px] font-semibold text-white">
                          {t("marketplace.results.viewAction")}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
                <p className="text-[18px] font-bold">{t("marketplace.results.noResultsTitle")}</p>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                  {t("marketplace.results.noResultsSubtitle")}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                >
                  {t("marketplace.results.clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-2xl bg-white">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.title}</DialogTitle>
                <DialogDescription>{t("marketplace.productDialog.subtitle")}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="h-56 w-full rounded-lg object-cover" />
                <div className="space-y-3 text-[14px]">
                  <p className="text-[18px] font-bold text-[var(--brand-primary)]">{selectedProduct.price.toLocaleString("fr-FR")} {selectedProduct.currency}</p>
                  <p>{t("marketplace.productDialog.seller", { name: selectedProduct.sellerName })}</p>
                  {selectedProduct.location && (
                    <p>
                      {t("marketplace.productDialog.location", {
                        location: `${selectedProduct.location}${selectedProduct.country ? `, ${selectedProduct.country}` : ""}`,
                      })}
                    </p>
                  )}
                  <RatingStars rating={selectedProduct.rating} reviewCount={selectedProduct.reviewCount} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => { if (!selectedProduct) return; const sellerId = selectedProduct.sellerProfileId ?? selectedProduct.sellerId; const sellerProfileUrl = sellerId ? "/pro/" + sellerId : "/annuaire"; const message = t("marketplace.productDialog.reserveMessage", { title: selectedProduct.title }); window.location.href = `${sellerProfileUrl}?message=${encodeURIComponent(message)}&product=${encodeURIComponent(selectedProduct.title)}`; }} className="h-10 rounded-full bg-[var(--brand-primary)] font-semibold text-white">{t("marketplace.productDialog.reserve")}</button>
                    <button type="button" onClick={() => setSelectedProduct(null)} className="h-10 rounded-full border border-[var(--brand-border)] font-semibold">{t("marketplace.productDialog.close")}</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={alertOpen}
        onOpenChange={(open) => {
          setAlertOpen(open);
          if (open) {
            setAlertError("");
            setAlertSuccess("");
          }
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t("marketplace.alertDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("marketplace.alertDialog.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              value={alertName}
              onChange={(event) => setAlertName(event.target.value)}
              placeholder={t("marketplace.alertDialog.namePlaceholder")}
              className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
            />
            <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                {t("marketplace.alertDialog.appliedFilters")}
              </p>
              <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{activeFilterSummary}</p>
            </div>
            {alertError && <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{alertError}</p>}
            {alertSuccess && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{alertSuccess}</p>}
            <button
              onClick={() => {
                setAlertError("");
                setAlertSuccess("");
                if (!user) {
                  setAlertError(t("marketplace.alertDialog.loginRequired"));
                  return;
                }
                if (alertName.trim().length < 3) {
                  setAlertError(t("marketplace.alertDialog.nameTooShort"));
                  return;
                }
                savedSearchActions.create.mutate(
                  {
                    name: alertName.trim(),
                    summary: activeFilterSummary || undefined,
                    criteria: {
                      search: debouncedSearch || undefined,
                      categories: selectedCategories,
                      types: selectedTypes,
                      sort,
                      priceMin: priceMin || undefined,
                      priceMax: priceMax || undefined,
                      country: country || undefined,
                      city: city || undefined,
                      minRating: minRating || undefined,
                      verifiedOnly: verifiedOnly || undefined,
                    },
                  },
                  {
                    onSuccess: () => {
                      setAlertSuccess(t("marketplace.alertDialog.createSuccess"));
                      setAlertName("");
                    },
                    onError: (mutationError) =>
                      setAlertError(
                        mutationError instanceof Error
                          ? mutationError.message
                          : t("marketplace.alertDialog.createError"),
                      ),
                  },
                );
              }}
              disabled={savedSearchActions.create.isPending}
              className="h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-60"
            >
              {t("marketplace.alertDialog.submit")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
