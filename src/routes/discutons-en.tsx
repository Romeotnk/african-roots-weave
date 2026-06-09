import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { questions } from "@/data/questions";

export const Route = createFileRoute("/discutons-en")({
  head: () => ({ meta: [{ title: "Discutons-en — Forum IWOSAN" }] }),
  component: Forum,
});

const tabs = ["Récentes", "Populaires", "Sans réponse", "Résolues"];
const topTags = [
  "moringa",
  "kinkéliba",
  "grossesse",
  "diabète",
  "karité",
  "neem",
  "arthrose",
  "fièvre",
  "digestion",
  "nutrition",
];

function Forum() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1920&q=80"
        badge="💬 Forum"
        title="Discutons-en"
        subtitle="Posez vos questions, partagez vos savoirs. Un espace modéré où les meilleures réponses sont validées par des praticiens vérifiés."
        size="md"
      >
        <button className="h-12 px-7 rounded-full bg-[var(--brand-gold)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--brand-gold-light)]">
          Poser une question
        </button>
      </HeroSection>
      <section className="py-12">
        <div className="container-iwosan">
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((t, i) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold ${i === 0 ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)]"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mb-8">
            <SearchBar placeholder="Rechercher dans le forum..." />
          </div>
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
            <aside className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  Top contributeurs
                </h3>
                <ul className="space-y-3">
                  {[
                    ["Dr. Amina T.", 2840],
                    ["Mama Aïssata", 2210],
                    ["Dr. Kwame M.", 1980],
                    ["Baba Sadio", 1450],
                    ["Tata Ngozi", 1120],
                  ].map(([n, r]) => (
                    <li key={n as string} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--brand-primary-subtle)] flex items-center justify-center font-bold text-[var(--brand-primary)] text-[13px]">
                        {(n as string).charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold">{n}</p>
                        <p className="text-[12px] text-[var(--color-text-muted)]">{r} pts</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-[16px] border border-[var(--brand-border-light)] p-6">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  Tags populaires
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {topTags.map((t) => (
                    <span
                      key={t}
                      className="text-[12px] px-2.5 py-1 rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
