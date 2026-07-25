import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Clock, Video } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SearchBar } from "@/components/shared/SearchBar";
import { RatingStars } from "@/components/shared/RatingStars";
import { trainings } from "@/data/trainings";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormations } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourses } from "@/lib/mappers/formation";

export const Route = createFileRoute("/formations")({
  head: () => ({ meta: [{ title: "Formations - IWOSAN" }] }),
  component: Formations,
});

const levels = ["Tous", "Debutant", "Intermediaire", "Avance"];
const formats = ["Tous formats", "video", "document", "presentiel"];
const prices = ["Tous prix", "gratuit", "payant"];

function Formations() {
  const formationsQuery = useFormations();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("Tous");
  const [format, setFormat] = useState("Tous formats");
  const [price, setPrice] = useState("Tous prix");
  const [category, setCategory] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);
  const apiTrainings = useMemo(() => toTrainingCourses(formationsQuery.data?.formations), [formationsQuery.data]);
  const courseList = apiTrainings.length > 0 ? apiTrainings : trainings;
  const categories = ["Toutes", ...Array.from(new Set(courseList.map((course) => course.category)))];

  const filtered = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    return courseList.filter((course) => {
      const matchesSearch = !normalized || [course.title, course.instructor, course.category].join(" ").toLowerCase().includes(normalized);
      const matchesLevel = level === "Tous" || course.level === level;
      const matchesFormat = format === "Tous formats" || course.format === format;
      const matchesPrice = price === "Tous prix" || (price === "gratuit" ? course.price === 0 : course.price > 0);
      const matchesCategory = category === "Toutes" || course.category === category;
      return matchesSearch && matchesLevel && matchesFormat && matchesPrice && matchesCategory;
    });
  }, [category, courseList, debouncedSearch, format, level, price]);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1920&q=80"
        badge="Formations"
        title="Formations IWOSAN"
        subtitle="Cours en ligne, documents et formations presencielles encadres par des praticiens et chercheurs reconnus."
        size="md"
      >
        <div className="mx-auto max-w-2xl">
          <SearchBar placeholder="Cours, formateur, theme..." value={search} onChange={setSearch} showFilters={false} />
        </div>
      </HeroSection>
      <section className="py-12">
        <div className="container-iwosan">
          <div className="mb-8 grid gap-3 lg:grid-cols-4">
            {[levels, formats, prices, categories].map((items, index) => {
              const value = [level, format, price, category][index];
              const setter = [setLevel, setFormat, setPrice, setCategory][index] as (value: string) => void;
              return (
                <select key={index} value={value} onChange={(event) => setter(event.target.value)} className="h-11 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold">
                  {items.map((item) => <option key={item}>{item}</option>)}
                </select>
              );
            })}
          </div>
          <p className="mb-5 text-[14px] text-[var(--color-text-muted)]"><strong className="text-[var(--color-text-primary)]">{filtered.length}</strong> formations</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <article key={course.id} className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm">
                <div className="relative h-[180px] overflow-hidden">
                  <img src={course.image} className="h-full w-full object-cover" alt="" />
                  <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-1 text-[11px] font-bold uppercase tracking-wider">{course.level}</span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-3 line-clamp-2 text-[16px] font-bold leading-snug">{course.title}</h3>
                  <div className="mb-3 flex items-center gap-2">
                    <img src={course.instructorAvatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                    <span className="text-[12px] text-[var(--color-text-muted)]">{course.instructor}</span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                    <span className="inline-flex items-center gap-1"><Video size={12} /> {course.format}</span>
                    <span className="inline-flex items-center gap-1"><BarChart3 size={12} /> {course.students}</span>
                  </div>
                  <RatingStars rating={course.rating} size="sm" showCount={false} />
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className={`font-bold ${course.price === 0 ? "text-[var(--brand-primary)]" : ""}`}>
                      {course.price === 0 ? "Gratuit" : `${course.price.toLocaleString("fr-FR")} ${course.currency}`}
                    </span>
                    <Link to="/formations/$id" params={{ id: course.id }} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[12px] font-semibold text-white">
                      Acceder
                    </Link>
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
