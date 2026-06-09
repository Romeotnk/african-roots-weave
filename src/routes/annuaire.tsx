import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { professionals } from "@/data/professionals";

export const Route = createFileRoute("/annuaire")({
  head: () => ({
    meta: [
      { title: "Annuaire des praticiens — IWOSAN" },
      {
        name: "description",
        content:
          "Découvrez nos praticiens traditionnels vérifiés, documentés et évalués par la communauté.",
      },
    ],
  }),
  component: Annuaire,
});

function Annuaire() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&q=80"
        badge="📖 Annuaire"
        title="Annuaire des Praticiens"
        subtitle="1 200 praticiens · 35 spécialités · 22 pays — chacun vérifié par notre équipe éditoriale."
        size="md"
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Annuaire" }]}
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Nom, spécialité, localisation..." />
        </div>
      </HeroSection>

      <section className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-[var(--brand-border-light)] py-4">
        <div className="container-iwosan flex items-center gap-3 flex-wrap">
          {["Toutes spécialités", "Tous pays", "Vérifié uniquement"].map((t, i) => (
            <button
              key={t}
              className={`px-4 h-10 rounded-full text-[13px] font-semibold border ${i === 2 ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : "border-[var(--brand-border)] text-[var(--color-text-secondary)]"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...professionals, ...professionals].map((p, i) => (
              <ProfessionalCard key={i} pro={p} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="h-12 px-8 rounded-full border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition">
              Charger plus de praticiens
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
