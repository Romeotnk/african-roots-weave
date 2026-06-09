import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/sante-quotidien")({
  head: () => ({
    meta: [
      { title: "Santé au quotidien — IWOSAN" },
      {
        name: "description",
        content: "Conseils, prévention et bien-être issus des savoirs africains.",
      },
    ],
  }),
  component: SanteQuotidien,
});

function SanteQuotidien() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&q=80"
        badge="📰 Blog"
        title="Santé au quotidien"
        subtitle="Conseils pratiques, prévention et bien-être issus des savoirs africains, vulgarisés par nos experts."
        size="md"
      />
      <section className="py-12 md:py-16">
        <div className="container-iwosan grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <aside className="space-y-6">
            <div className="bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6">
              <h3 className="font-bold text-[15px] mb-4 uppercase tracking-wider text-[var(--color-text-muted)]">
                Catégories
              </h3>
              <ul className="space-y-2 text-[14px]">
                {[
                  "Nutrition",
                  "Sommeil",
                  "Prévention",
                  "Femme & enfant",
                  "Maladies chroniques",
                  "Bien-être mental",
                ].map((c) => (
                  <li key={c}>
                    <a className="text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] cursor-pointer">
                      {c}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--brand-primary-subtle)] rounded-[16px] p-6">
              <h3 className="font-bold text-[15px] mb-3 text-[var(--brand-primary)]">
                Articles populaires
              </h3>
              <ol className="space-y-3 text-[14px]">
                {articles.slice(0, 5).map((a, i) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="font-extrabold text-[var(--brand-primary)]">{i + 1}</span>
                    <span className="text-[var(--color-text-secondary)]">{a.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
