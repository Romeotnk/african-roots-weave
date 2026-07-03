import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Grid2X2, Map, MapPin, Navigation, Star, X } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProductCard } from "@/components/shared/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/types";
import { getProducts } from "@/lib/api/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function Marketplace() {
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
  const [auctionOnly, setAuctionOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategories[0]) params.set("category", selectedCategories[0]);
    if (selectedTypes[0]) params.set("type", selectedTypes[0]);
    if (sort) params.set("sort", sort);
    params.set("limit", "24");
    return params;
  }, [selectedCategories, selectedTypes, sort]);

  const categories = useMemo(() => {
    const counts = items.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([label, count]) => ({ label, value: label, count }));
  }, [items]);

  const countries = useMemo(
    () => Array.from(new Set(items.map((product) => product.country).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), "fr")),
    [items],
  );

  const activeFilterSummary = useMemo(() => {
    const parts = [
      debouncedSearch && `Recherche "${debouncedSearch}"`,
      selectedCategories.length > 0 && `${selectedCategories.length} categorie(s)`,
      selectedTypes.length > 0 && `${selectedTypes.length} type(s)`,
      (priceMin || priceMax || priceRange[0] > 0 || priceRange[1] < 50000) &&
        `${priceMin || priceRange[0]}-${priceMax || priceRange[1]} FCFA`,
      country && `Pays: ${country}`,
      city && `Ville: ${city}`,
      minRating > 0 && `Note ${minRating}+`,
      auctionOnly && "Encheres",
      verifiedOnly && "Vendeurs verifies",
    ].filter(Boolean);
    return parts.join(", ") || "Tous les resultats marketplace";
  }, [
    auctionOnly,
    city,
    country,
    debouncedSearch,
    minRating,
    priceMax,
    priceMin,
    priceRange,
    selectedCategories,
    selectedTypes,
    verifiedOnly,
  ]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    const min = priceMin === "" ? priceRange[0] : Number(priceMin);
    const max = priceMax === "" ? priceRange[1] : Number(priceMax);
    const now = new Date("2026-06-15").getTime();

    const filtered = items.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.title, product.category, product.sellerName, product.type, product.location, product.country]
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
      const matchesAuction = !auctionOnly || Boolean(product.auction);
      const matchesVerified = !verifiedOnly || Boolean(product.verified);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesCountry &&
        matchesCity &&
        matchesDate &&
        matchesRating &&
        matchesAuction &&
        matchesVerified
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
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
    auctionOnly,
    city,
    country,
    dateFilter,
    debouncedSearch,
    items,
    minRating,
    priceMax,
    priceMin,
    priceRange,
    selectedCategories,
    selectedTypes,
    sort,
    verifiedOnly,
  ]);

  const activeFilterCount = [
    selectedCategories.length,
    selectedTypes.length,
    priceMin || priceMax || priceRange[0] > 0 || priceRange[1] < 50000,
    debouncedSearch,
    country,
    city,
    dateFilter !== "all",
    minRating,
    auctionOnly,
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
    setAuctionOnly(false);
    setVerifiedOnly(false);
    setSort("newest");
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const toggleType = (value: Product["type"]) => {
    setSelectedTypes((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
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
          <SearchBar placeholder="Plante, produit, vendeur..." value={search} onChange={setSearch} />
        </div>
      </HeroSection>

      <section className="py-12">
        <div className="container-iwosan grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6 h-fit sticky top-[88px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[16px]">Filtres</h3>
              <button
                onClick={resetFilters}
                className="text-[12px] text-[var(--brand-primary)] font-semibold"
              >
                Reinitialiser {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
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
                      type="checkbox"
                      checked={selectedCategories.includes(item.value)}
                      onChange={() => toggleCategory(item.value)}
                      className="accent-[var(--brand-primary)]"
                    />
                    <span className="flex-1 text-[var(--color-text-secondary)]">{item.label}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{item.count}</span>
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
                  ["physical", "Produit physique"],
                  ["service", "Service"],
                  ["digital", "Produit numerique"],
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
                Prix <ChevronDown size={14} />
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
                  placeholder="Min"
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
                <input
                  type="number"
                  min="0"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  placeholder="Max"
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Localisation <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-3">
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 text-[13px]"
                >
                  <option value="">Tous pays</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ville"
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                />
                <div>
                  <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--color-text-muted)]">
                    <span>Distance</span>
                    <span>{distance[0]} km</span>
                  </div>
                  <Slider value={distance} min={0} max={500} step={10} onValueChange={setDistance} />
                </div>
                <button className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--brand-border)] text-[12px] font-semibold">
                  <Navigation size={14} /> Geolocalisation activee
                </button>
              </div>
            </details>
            <details className="border-t border-[var(--brand-border-light)] py-4">
              <summary className="font-semibold text-[14px] cursor-pointer flex items-center justify-between">
                Publication & qualite <ChevronDown size={14} />
              </summary>
              <div className="mt-3 space-y-3">
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 text-[13px]"
                >
                  <option value="all">Toutes dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
                <div>
                  <p className="mb-2 text-[12px] font-semibold">Note minimale</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={rating <= minRating ? "text-[var(--brand-gold)]" : "text-[var(--brand-border)]"}
                        aria-label={`${rating} etoiles minimum`}
                      >
                        <Star size={18} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  Encheres uniquement <Switch checked={auctionOnly} onCheckedChange={setAuctionOnly} />
                </label>
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  Vendeurs KYC verifies <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                </label>
              </div>
            </details>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <span className="font-bold text-[var(--color-text-primary)]">
                  {isLoading ? "Chargement..." : `${filteredItems.length} resultats`}
                </span>
                {debouncedSearch && !isLoading ? ` pour "${debouncedSearch}"` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAlertOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  <Bell size={15} /> Creer une alerte
                </button>
                <Link
                  to="/marketplace/deposer"
                  className="inline-flex h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white"
                >
                  Deposer une annonce
                </Link>
                <div className="inline-flex h-10 rounded-full border border-[var(--brand-border)] bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 text-[12px] font-semibold ${viewMode === "grid" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                  >
                    <Grid2X2 size={14} /> Grille
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 text-[12px] font-semibold ${viewMode === "map" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                  >
                    <Map size={14} /> Carte
                  </button>
                </div>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 px-4 rounded-full border border-[var(--brand-border)] text-[13px] bg-white"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="newest">Les plus recents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix decroissant</option>
                  <option value="rating">Les mieux notes</option>
                  <option value="popular">Plus populaire</option>
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
                    {filter} <X size={12} />
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
                    {priceMin || "0"} - {priceMax || "max"} FCFA <X size={12} />
                  </button>
                )}
              </div>
            )}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid xl:grid-cols-[1fr_340px] gap-6">
                <div className="relative min-h-[560px] overflow-hidden rounded-[16px] border border-[var(--brand-border-light)] bg-[linear-gradient(135deg,#e3f3ec,#f5efd6)]">
                  <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[12px] font-semibold shadow-iwosan-sm">
                    {filteredItems.length} marqueurs synchronises
                  </div>
                  <div className="absolute bottom-5 left-5 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-4 py-2 text-[12px] font-semibold text-[var(--brand-primary)]">
                    Rayon mock: {distance[0]} km
                  </div>
                  {filteredItems.map((product, index) => (
                    <button
                      key={product.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-primary)] px-3 py-2 text-[12px] font-bold text-white shadow-iwosan-md"
                      style={{
                        left: `${18 + ((index * 23) % 68)}%`,
                        top: `${22 + ((index * 17) % 58)}%`,
                      }}
                      title={product.title}
                    >
                      {Math.round(product.price / 1000)}k
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredItems.slice(0, 5).map((product) => (
                    <article key={product.id} className="flex gap-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-3">
                      <img src={product.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-bold">{product.title}</p>
                        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                          {product.location ?? "Localisation"} - {product.price.toLocaleString("fr-FR")} {product.currency}
                        </p>
                        <button className="mt-2 h-8 rounded-full bg-[var(--brand-primary)] px-3 text-[12px] font-semibold text-white">
                          Voir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
                <p className="text-[18px] font-bold">Aucun resultat</p>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                  Essayez une autre recherche ou reinitialisez les filtres.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Creer une alerte</DialogTitle>
            <DialogDescription>
              Recevez une notification mock lorsque de nouvelles annonces correspondent a ces filtres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              value={alertName}
              onChange={(event) => setAlertName(event.target.value)}
              placeholder="Nom de l'alerte"
              className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
            />
            <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Filtres appliques
              </p>
              <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{activeFilterSummary}</p>
            </div>
            <button
              onClick={() => {
                setAlertName("");
                setAlertOpen(false);
              }}
              className="h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white"
            >
              Enregistrer l'alerte
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
