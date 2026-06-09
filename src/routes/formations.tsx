import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { RatingStars } from "@/components/shared/RatingStars";
import { Clock, BarChart3, Video } from "lucide-react";

export const Route = createFileRoute("/formations")({
  head: () => ({ meta: [{ title: "Formations — IWOSAN" }] }),
  component: Formations,
});

const courses = [
  {
    title: "Pharmacopée fondamentale : 80 plantes essentielles",
    instructor: "Dr. Amina Traoré",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&q=80",
    duration: "12h",
    level: "Débutant",
    price: "Gratuit",
    students: 3240,
    rating: 4.9,
    thumb: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80",
  },
  {
    title: "Protocoles de préparation et dosage clinique",
    instructor: "Dr. Kwame Mensah",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80",
    duration: "18h",
    level: "Intermédiaire",
    price: "45 000 FCFA",
    students: 1287,
    rating: 4.8,
    thumb: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80",
  },
  {
    title: "Accompagnement périnatal selon les rites Sawa",
    instructor: "Mama Rose Ekwalla",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    duration: "9h",
    level: "Intermédiaire",
    price: "32 000 FCFA",
    students: 642,
    rating: 4.9,
    thumb: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80",
  },
  {
    title: "Ethnobotanique de terrain : méthodologie",
    instructor: "Dr. Amina Traoré",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&q=80",
    duration: "24h",
    level: "Avancé",
    price: "80 000 FCFA",
    students: 387,
    rating: 5.0,
    thumb: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80",
  },
];

function Formations() {
  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1920&q=80"
        badge="🎓 Formations"
        title="Formations IWOSAN"
        subtitle="Cours en ligne, webinaires et certifications encadrés par des praticiens et chercheurs reconnus."
        size="md"
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Cours, formateur, thème..." />
        </div>
      </HeroSection>
      <section className="py-12">
        <div className="container-iwosan">
          <div className="flex gap-2 mb-10 flex-wrap">
            {["Tous", "Débutant", "Intermédiaire", "Avancé", "Gratuit", "Live", "Vidéo"].map(
              (f, i) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold ${i === 0 ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)]"}`}
                >
                  {f}
                </button>
              ),
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c, i) => (
              <article
                key={i}
                className="bg-white rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover flex flex-col"
              >
                <div className="h-[160px] overflow-hidden relative">
                  <img src={c.thumb} className="w-full h-full object-cover" alt="" />
                  <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-white/95 px-2 py-1 rounded">
                    {c.level}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[15px] leading-snug line-clamp-2 mb-3">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={c.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {c.instructor}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-muted)] mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {c.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Video size={12} />
                      Vidéo
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 size={12} />
                      {c.students}
                    </span>
                  </div>
                  <RatingStars rating={c.rating} size="sm" showCount={false} />
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span
                      className={`font-bold ${c.price === "Gratuit" ? "text-[var(--brand-primary)]" : "text-[var(--color-text-primary)]"}`}
                    >
                      {c.price}
                    </span>
                    <button className="px-4 h-9 rounded-full bg-[var(--brand-primary)] text-white text-[12px] font-semibold hover:bg-[var(--brand-primary-dark)]">
                      Accéder
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
