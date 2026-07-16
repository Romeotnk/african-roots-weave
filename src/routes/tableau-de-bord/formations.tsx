import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Eye, GraduationCap, PlayCircle, Plus, Search, Upload } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { trainings } from "@/data/trainings";

export const Route = createFileRoute("/tableau-de-bord/formations")({
  head: () => ({ meta: [{ title: "Mes formations - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["researcher", "professional", "admin", "super_admin"]}>
      <TrainingsDashboard />
    </ProtectedRoute>
  ),
});

type CourseStatus = "published" | "draft" | "archived";
type CourseLevel = (typeof trainings)[number]["level"];
type LocalCourse = (typeof trainings)[number] & { status: CourseStatus; progress: number };

type CourseForm = {
  title: string;
  category: string;
  level: CourseLevel;
  duration: string;
  price: string;
};

const emptyCourseForm: CourseForm = {
  title: "",
  category: "Pharmacopée",
  level: "Debutant",
  duration: "2h",
  price: "0",
};

const statusLabels: Record<CourseStatus, string> = {
  published: "Publiée",
  draft: "Brouillon",
  archived: "Archivée",
};

function TrainingsDashboard() {
  const [courses, setCourses] = useState<LocalCourse[]>(
    trainings.map((course, index) => ({
      ...course,
      status: index === 1 ? "draft" : "published",
      progress: index === 2 ? 65 : 100,
    })),
  );
  const [filter, setFilter] = useState<CourseStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyCourseForm);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesStatus = filter === "all" || course.status === filter;
      const matchesSearch =
        !normalized ||
        course.title.toLowerCase().includes(normalized) ||
        course.category.toLowerCase().includes(normalized) ||
        course.level.toLowerCase().includes(normalized);
      return matchesStatus && matchesSearch;
    });
  }, [courses, filter, query]);

  const updateStatus = (id: string, status: CourseStatus) => {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, status } : course)));
    setMessage(status === "published" ? "Formation publiée." : status === "archived" ? "Formation archivée." : "Formation repassée en brouillon.");
  };

  const duplicateCourse = (id: string) => {
    const source = courses.find((course) => course.id === id);
    if (!source) return;
    setCourses((current) => [{ ...source, id: `local-${Date.now()}`, title: `${source.title} - copie`, status: "draft", progress: 20 }, ...current]);
    setMessage("Copie créée en brouillon.");
  };

  const createCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const price = Number(form.price);

    if (title.length < 6) {
      setMessage("Le titre de la formation doit contenir au moins 6 caractères.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setMessage("Le prix doit être un nombre positif ou 0 pour une formation gratuite.");
      return;
    }

    const id = `local-${Date.now()}`;
    setCourses((current) => [
      {
        id,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id,
        title,
        instructor: "Votre espace professionnel",
        instructorAvatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&q=80",
        instructorBio: "Formation ajoutée depuis le tableau de bord professionnel.",
        duration: form.duration.trim() || "2h",
        level: form.level,
        format: "video",
        category: form.category.trim() || "Général",
        price,
        currency: "XOF",
        rating: 0,
        students: 0,
        image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1200&q=80",
        prerequisites: ["À compléter avant publication"],
        learnings: ["Objectifs pédagogiques à renseigner"],
        modules: [{ title: "Module 1", lessons: [{ id: `${id}-lesson`, title: "Introduction", duration: "10 min", type: "video" }] }],
        reviews: [],
        status: "draft",
        progress: 25,
      },
      ...current,
    ]);
    setForm(emptyCourseForm);
    setShowForm(false);
    setMessage("Formation créée en brouillon. Complétez les modules avant publication.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Communaute</p>
              <h1 className="mt-2 text-[32px] md:text-[42px]">Mes formations</h1>
              <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                Gérez les ressources de formation que vous avez créées ou publiées.
              </p>
            </div>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
              <Plus size={17} /> {showForm ? "Fermer" : "Nouvelle formation"}
            </button>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Formations" value={courses.length} icon={GraduationCap} />
          <StatCard label="Publiées" value={courses.filter((course) => course.status === "published").length} icon={Upload} />
          <StatCard label="Apprenants" value={courses.reduce((sum, course) => sum + course.students, 0)} icon={PlayCircle} />
        </div>

        {showForm && (
          <form onSubmit={createCourse} className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-5">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titre de la formation" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px] md:col-span-2" />
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Catégorie" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as CourseLevel }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]">
                <option value="Debutant">Débutant</option>
                <option value="Intermediaire">Intermédiaire</option>
                <option value="Avance">Avancé</option>
              </select>
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-gold)] px-5 text-[13px] font-bold text-[var(--color-text-primary)]">
                Créer
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder="Durée ex. 2h" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} inputMode="numeric" placeholder="Prix XOF" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
            </div>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une formation..." className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {([[
              "all", "Toutes"],
              ["published", "Publiées"],
              ["draft", "Brouillons"],
              ["archived", "Archivées"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`h-10 rounded-full border px-4 text-[13px] font-semibold ${filter === value ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <GraduationCap className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune formation trouvée</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Changez le filtre, la recherche ou créez une nouvelle ressource.</p>
            </div>
          )}

          {filtered.map((course) => (
            <article key={course.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                <img src={course.image} alt="" className="aspect-video w-full rounded-[8px] object-cover lg:aspect-square" />
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">{statusLabels[course.status]}</span>
                      <h2 className="mt-3 text-[18px] font-bold">{course.title}</h2>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{course.category} - {course.level} - {course.duration}</p>
                    </div>
                    <p className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
                      {course.price === 0 ? "Gratuit" : `${course.price.toLocaleString("fr-FR")} ${course.currency}`}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[12px] font-semibold text-[var(--color-text-muted)]">
                      <span>Complétude</span><span>{course.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[var(--brand-surface-alt)]">
                      <div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/formations/$id" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <Eye size={15} /> Aperçu
                    </Link>
                    <Link to="/formations/$id/apprendre" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <PlayCircle size={15} /> Apprendre
                    </Link>
                    <button type="button" onClick={() => updateStatus(course.id, course.status === "published" ? "draft" : "published")} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                      <Upload size={15} /> {course.status === "published" ? "Dépublier" : "Publier"}
                    </button>
                    <button type="button" onClick={() => duplicateCourse(course.id)} className="inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      Dupliquer
                    </button>
                    <button type="button" onClick={() => updateStatus(course.id, "archived")} disabled={course.status === "archived"} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                      <Archive size={15} /> Archiver
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof GraduationCap }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[28px] font-extrabold">{value.toLocaleString("fr-FR")}</p>
    </div>
  );
}
