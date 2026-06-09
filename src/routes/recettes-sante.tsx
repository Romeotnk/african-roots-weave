import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { articles } from "@/data/articles";
import { ChefHat, Leaf, Soup, Coffee } from "lucide-react";

export const Route = createFileRoute("/recettes-sante")({
  head: () => ({ meta: [{ title: "Recettes santé — IWOSAN" }] }),
  component: Recettes,
});

const themes = [
  { name: "Tisanes & infusions", count: 64, icon: Coffee, color: "bg-amber-50 text-amber-700" },
  { name: "Décoctions", count: 42, icon: Soup, color: "bg-orange-50 text-orange-700" },
  { name: "Cataplasmes & baumes", count: 28, icon: Leaf, color: "bg-green-50 text-green-700" },
  {
    name: "Préparations culinaires santé",
    count: 53,
    icon: ChefHat,
    color: "bg-rose-50 text-rose-700",
  },
];

function Recettes() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=1920&q=80"
        badge="🍵 Recettes"
        title="Recettes Santé"
        subtitle="Préparations traditionnelles documentées pas à pas, avec dosages, indications et précautions."
        size="md"
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Recette, plante, indication..." />
        </div>
      </HeroSection>
      <section className="py-16">
        <div className="container-iwosan">
          <h2 className="text-[28px] mb-8">Parcourir par thème</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {themes.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-[16px] p-6 border border-[var(--brand-border-light)] card-hover"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center mb-4`}
                >
                  <t.icon size={22} />
                </div>
                <h3 className="font-bold text-[16px]">{t.name}</h3>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
                  {t.count} recettes
                </p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.slice(0, 4).map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            <aside className="bg-[var(--brand-primary)] text-white rounded-[16px] p-6 h-fit">
              <h3 className="font-bold text-[18px] mb-2">Besoin d'aide ?</h3>
              <p className="text-[14px] text-white/80 leading-[1.6] mb-5">
                Un doute sur une posologie, une plante, une indication ? Notre équipe répond sous
                24h.
              </p>
              <button className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[var(--color-text-primary)] font-semibold">
                Ouvrir un ticket
              </button>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
