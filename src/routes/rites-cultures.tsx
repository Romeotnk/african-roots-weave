import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/rites-cultures")({
  head: () => ({
    meta: [
      { title: "Rites & Cultures — IWOSAN" },
      {
        name: "description",
        content: "Cérémonies de guérison, symboliques végétales et transmission ancestrale.",
      },
    ],
  }),
  component: RitesCultures,
});

const cats = [
  "Toutes",
  "Cérémonies de guérison",
  "Symboliques végétales",
  "Transmission maître-disciple",
  "Rites initiatiques",
];

function RitesCultures() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80"
        badge="📜 Patrimoine vivant"
        title="Rites & Cultures"
        subtitle="Cérémonies de guérison, symboliques végétales et transmission des savoirs initiatiques à travers le continent."
        size="md"
      />
      <section className="py-12 md:py-16">
        <div className="container-iwosan">
          <div className="flex gap-2 mb-10 flex-wrap">
            {cats.map((c, i) => (
              <button
                key={c}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold ${i === 0 ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
