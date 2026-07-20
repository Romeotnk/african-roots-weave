import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchBar } from "@/components/shared/SearchBar";
import { PlantCard } from "@/components/shared/PlantCard";
import { plants } from "@/data/plants";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMonographs } from "@/hooks/useContentApi";
import { mapMonographsToPlants } from "@/lib/mappers/plantMonograph";

export const Route = createFileRoute("/pharmacopee")({
  head: () => ({
    meta: [
      { title: "Pharmacopée vivante — IWOSAN" },
      {
        name: "description",
        content: "Monographies scientifiques des plantes médicinales africaines.",
      },
    ],
  }),
  component: Pharmacopee,
});

const cats = [
  "Toutes",
  "Anti-infectieux",
  "Gynécologie",
  "Gastro-intestinal",
  "Neurologie",
  "Dermatologie",
  "Cardio-vasculaire",
  "Pulmonaire",
];

function Pharmacopee() {
  const { data: monographs } = useMonographs();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);
  const apiPlants = useMemo(() => mapMonographsToPlants(monographs), [monographs]);
  const plantSource = apiPlants.length ? apiPlants : plants;
  const featured = plantSource[0];

  const filteredPlants = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return plantSource.filter((plant) => {
      const searchable = [
        plant.scientificName,
        plant.family,
        plant.origin,
        plant.summary,
        ...plant.vernacularNames,
        ...plant.indications,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = category === "Toutes" || plant.indications.includes(category) || plant.family === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, debouncedSearch, plantSource]);

  return (
    <>
      <section className="relative min-h-[60vh] flex items-center bg-[var(--brand-primary-dark)] text-white">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=80"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="relative container-iwosan py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 text-[var(--brand-gold)] px-4 py-1.5 text-[12px] font-semibold backdrop-blur-sm">
            Exclusif — Géré par l'équipe éditoriale Iwosan
          </span>
          <h1 className="mt-5 text-white text-[40px] md:text-[56px]">Pharmacopée Vivante</h1>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto text-[17px] leading-[1.7]">
            Monographies scientifiques des plantes médicinales africaines — nomenclature, principes
            actifs, indications thérapeutiques et modes de préparation illustrés.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar
              placeholder="Rechercher une plante par nom scientifique ou vernaculaire..."
              value={search}
              onChange={setSearch}
              showFilters={false}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <div className="bg-white rounded-[20px] overflow-hidden shadow-iwosan-md grid md:grid-cols-[40%_60%]">
            <div className="h-[280px] md:h-auto">
              <img src={featured.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="p-7 md:p-10">
              <span className="inline-flex bg-[var(--brand-gold)] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                🌿 Plante de la semaine
              </span>
              <h2 className="mt-3 text-[28px] italic text-[var(--brand-primary)] font-semibold">
                {featured.scientificName}
              </h2>
              <div className="mt-2 flex gap-2 flex-wrap">
                {featured.vernacularNames.map((v) => (
                  <span
                    key={v}
                    className="text-[12px] px-2.5 py-1 rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-semibold"
                  >
                    {v}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
                {featured.summary}
              </p>
              <div className="mt-5">
                <p className="text-[12px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">
                  Indications
                </p>
                <div className="flex gap-2 flex-wrap">
                  {featured.indications.map((i) => (
                    <span
                      key={i}
                      className="text-[13px] px-3 py-1 rounded-full bg-[var(--brand-surface-alt)]"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/pharmacopee/$slug"
                params={{ slug: featured.slug }}
                className="mt-7 h-11 px-6 rounded-full bg-[var(--brand-primary)] text-white font-semibold inline-flex items-center gap-2 hover:bg-[var(--brand-primary-dark)] transition"
              >
                Lire la monographie complète <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-iwosan">
          <SectionHeader label="Parcourir" title="Par catégorie thérapeutique" />
          <div className="flex gap-2 mb-8 flex-wrap">
            {cats.map((c, i) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold ${category === c || (i === 0 && category === "Toutes") ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mb-6 text-[14px] text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text-primary)]">{filteredPlants.length}</strong> plantes
            trouvees{debouncedSearch ? ` pour "${debouncedSearch}"` : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlants.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
          {filteredPlants.length === 0 && (
            <div className="mt-6 rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <p className="font-bold">Aucune plante trouvee</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("Toutes");
                }}
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
