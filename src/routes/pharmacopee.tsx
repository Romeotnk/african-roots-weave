import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { PlantCard } from "@/components/shared/PlantCard";
import { plants } from "@/data/plants";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArrowRight } from "lucide-react";

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

const cats: Array<{ label: string; match: string[] }> = [
  { label: "Toutes", match: [] },
  { label: "Anti-infectieux", match: ["infect", "fievre", "paludism"] },
  { label: "Gynécologie", match: ["gyne", "femme", "fertil", "post-partum"] },
  { label: "Gastro-intestinal", match: ["digest", "gastro", "intestin", "foie", "hepat"] },
  { label: "Neurologie", match: ["nerveu", "sommeil", "stress", "anxiet"] },
  { label: "Dermatologie", match: ["peau", "cutan", "eczema", "cicatris", "dermat"] },
  { label: "Cardio-vasculaire", match: ["cardio", "tension", "hyperten", "circul"] },
  { label: "Pulmonaire", match: ["pulmon", "toux", "respir", "bronch"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Pharmacopee() {
  const featured = plants[0];
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Toutes");

  const filtered = useMemo(() => {
    const cat = cats.find((c) => c.label === activeCat);
    return plants.filter((p) => {
      if (cat && cat.match.length) {
        const blob = normalize(
          [...p.indications, p.summary, p.family].join(" "),
        );
        if (!cat.match.some((m) => blob.includes(m))) return false;
      }
      if (search) {
        const q = normalize(search);
        const blob = normalize(
          [p.scientificName, p.family, p.origin, p.summary, ...p.vernacularNames, ...p.indications].join(" "),
        );
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [search, activeCat]);

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
              <button className="mt-7 h-11 px-6 rounded-full bg-[var(--brand-primary)] text-white font-semibold inline-flex items-center gap-2 hover:bg-[var(--brand-primary-dark)] transition">
                Lire la monographie complète <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-iwosan">
          <SectionHeader label="Parcourir" title="Par catégorie thérapeutique" />
          <div className="flex gap-2 mb-8 flex-wrap">
            {cats.map((c) => {
              const active = activeCat === c.label;
              return (
                <button
                  key={c.label}
                  onClick={() => setActiveCat(c.label)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition ${active ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <p className="mb-4 text-[13px] text-[var(--color-text-muted)]">
            {filtered.length} plante{filtered.length > 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--brand-border)] px-4 py-8 text-center text-[14px] text-[var(--color-text-muted)]">
              Aucune plante ne correspond a votre recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <PlantCard key={p.id} plant={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
