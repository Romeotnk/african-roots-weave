import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Clock, Video } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { SearchBar } from "@/components/shared/SearchBar";
import { RatingStars } from "@/components/shared/RatingStars";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormations } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourses } from "@/lib/mappers/formation";

export const Route = createFileRoute("/formations/")({
  head: () => ({ meta: [{ title: "Formations - IWOSAN" }] }),
  component: Formations,
});

const levels = ["Tous", "Debutant", "Intermediaire", "Avance"];
const formats = ["Tous formats", "video", "document", "presentiel"];
const prices = ["Tous prix", "gratuit", "payant"];

function Formations() {
  const { t } = useTranslation();
  const levelLabels: Record<string, string> = {
    "Tous": t("formations.filters.allLevels"),
    "Debutant": t("formations.filters.beginner"),
    "Intermediaire": t("formations.filters.intermediate"),
    "Avance": t("formations.filters.advanced"),
  };
  const formatLabels: Record<string, string> = {
    "Tous formats": t("formations.filters.allFormats"),
    "video": t("formations.filters.video"),
    "document": t("formations.filters.document"),
    "presentiel": t("formations.filters.inPerson"),
  };
  const priceLabels: Record<string, string> = {
    "Tous prix": t("formations.filters.allPrices"),
    "gratuit": t("formations.filters.free"),
    "payant": t("formations.filters.paid"),
  };
  const optionLabelMaps = [levelLabels, formatLabels, priceLabels, {} as Record<string, string>];
  const formationsQuery = useFormations();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("Tous");
  const [format, setFormat] = useState("Tous formats");
  const [price, setPrice] = useState("Tous prix");
  const [category, setCategory] = useState("Toutes");
  const debouncedSearch = useDebounce(search, 300);
  const apiTrainings = useMemo(() => toTrainingCourses(formationsQuery.data?.formations), [formationsQuery.data]);
  const courseList = apiTrainings;
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
        badge={t("formations.hero.badge")}
        title={t("formations.hero.title")}
        subtitle={t("formations.hero.subtitle")}
        size="md"
      >
        <div className="mx-auto max-w-2xl">
          <SearchBar placeholder={t("formations.hero.searchPlaceholder")} value={search} onChange={setSearch} showFilters={false} />
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
                  {items.map((item) => <option key={item} value={item}>{optionLabelMaps[index][item] ?? item}</option>)}
                </select>
              );
            })}
          </div>
          <p className="mb-5 text-[14px] text-[var(--color-text-muted)]">{t("formations.results.count", { count: filtered.length })}</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, index) => (
              <Reveal key={course.id} delayMs={staggerDelay(index % 9)} className="flex">
              <article className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm card-hover">
                <div className="relative h-[180px] overflow-hidden bg-[var(--brand-surface-alt)]">
                  <img src={course.image} className="h-full w-full object-cover" alt="" loading="lazy" decoding="async" />
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
                      {course.price === 0 ? t("formations.filters.free") : `${course.price.toLocaleString("fr-FR")} ${course.currency}`}
                    </span>
                    <Link to="/formations/$id" params={{ id: course.id }} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[12px] font-semibold text-white">
                      {t("formations.access")}
                    </Link>
                  </div>
                </div>
              </article>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="mt-6 rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <p className="font-bold">{t("formations.results.notFound")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
