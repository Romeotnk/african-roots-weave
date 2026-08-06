import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, GraduationCap, Loader2, PlayCircle, Plus, Search, Upload } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useCreateFormation, useMyFormations, useUpdateFormation } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourses } from "@/lib/mappers/formation";
import type { TrainingCourse } from "@/types";

export const Route = createFileRoute("/tableau-de-bord/formations")({
  head: () => ({ meta: [{ title: "Mes formations - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["researcher", "professional", "admin", "super_admin"]}>
      <TrainingsDashboard />
    </ProtectedRoute>
  ),
});

type CourseStatus = "published" | "draft";
type LocalCourse = TrainingCourse & { status: CourseStatus };

type CourseForm = {
  title: string;
  category: string;
  level: TrainingCourse["level"];
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
};

function TrainingsDashboard() {
  const myFormationsQuery = useMyFormations();
  const createFormation = useCreateFormation();
  const updateFormation = useUpdateFormation();

  const courses: LocalCourse[] = useMemo(() => {
    const raw = (myFormationsQuery.data?.formations ?? []) as { isPublished?: boolean }[];
    return toTrainingCourses(raw).map((course, index) => ({
      ...course,
      status: raw[index]?.isPublished ? "published" : "draft",
    }));
  }, [myFormationsQuery.data]);

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
    updateFormation.mutate(
      { id, payload: { isPublished: status === "published" } },
      {
        onSuccess: () => setMessage(status === "published" ? "Formation publiée." : "Formation repassée en brouillon."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Action impossible."),
      },
    );
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

    createFormation.mutate(
      {
        title,
        type: "DOCUMENT",
        fileUrl: "",
        category: form.category.trim() || "Général",
        level: form.level,
        duration: form.duration.trim() || "2h",
        price,
        currency: "XOF",
        prerequisites: ["À compléter avant publication"],
        learnings: ["Objectifs pédagogiques à renseigner"],
        isPublished: false,
      },
      {
        onSuccess: () => {
          setForm(emptyCourseForm);
          setShowForm(false);
          setMessage("Formation créée en brouillon. Complétez les modules avant publication.");
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : "Impossible de créer la formation."),
      },
    );
  };

  return (
    <AccountLayout
      title="Mes formations"
      description="Gérez les ressources de formation que vous avez créées ou publiées."
      actions={
        <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
          <Plus size={17} /> {showForm ? "Fermer" : "Nouvelle formation"}
        </button>
      }
    >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Formations" value={courses.length} icon={GraduationCap} />
          <StatCard label="Publiées" value={courses.filter((course) => course.status === "published").length} icon={Upload} />
          <StatCard label="Téléchargements" value={courses.reduce((sum, course) => sum + course.students, 0)} icon={PlayCircle} />
        </div>

        {showForm && (
          <form onSubmit={createCourse} className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-5">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titre de la formation" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px] md:col-span-2" />
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Catégorie" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as TrainingCourse["level"] }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]">
                <option value="Debutant">Débutant</option>
                <option value="Intermediaire">Intermédiaire</option>
                <option value="Avance">Avancé</option>
              </select>
              <button type="submit" disabled={createFormation.isPending} className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-gold)] px-5 text-[13px] font-bold text-[var(--color-text-primary)] disabled:opacity-50">
                {createFormation.isPending ? "Creation..." : "Créer"}
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
            {([
              ["all", "Toutes"],
              ["published", "Publiées"],
              ["draft", "Brouillons"],
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
          {myFormationsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : myFormationsQuery.isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger vos formations pour le moment.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <GraduationCap className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune formation trouvée</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Changez le filtre, la recherche ou créez une nouvelle ressource.</p>
            </div>
          ) : (
          filtered.map((course) => (
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

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/formations/$id" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <Eye size={15} /> Aperçu
                    </Link>
                    <Link to="/formations/$id/apprendre" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <PlayCircle size={15} /> Apprendre
                    </Link>
                    <button
                      type="button"
                      onClick={() => updateStatus(course.id, course.status === "published" ? "draft" : "published")}
                      disabled={updateFormation.isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                    >
                      <Upload size={15} /> {course.status === "published" ? "Dépublier" : "Publier"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
          )}
        </div>
    </AccountLayout>
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
