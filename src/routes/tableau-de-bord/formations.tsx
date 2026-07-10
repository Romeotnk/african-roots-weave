import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Eye, GraduationCap, PlayCircle, Plus, Upload } from "lucide-react";
import { useMemo, useState } from "react";
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
type LocalCourse = (typeof trainings)[number] & { status: CourseStatus; progress: number };

const statusLabels: Record<CourseStatus, string> = {
  published: "Publiee",
  draft: "Brouillon",
  archived: "Archivee",
};

function TrainingsDashboard() {
  const [courses, setCourses] = useState<LocalCourse[]>(
    trainings.map((course, index) => ({ ...course, status: index === 1 ? "draft" : "published", progress: index === 2 ? 65 : 100 })),
  );
  const [filter, setFilter] = useState<CourseStatus | "all">("all");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => courses.filter((course) => filter === "all" || course.status === filter), [courses, filter]);

  const updateStatus = (id: string, status: CourseStatus) => {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, status } : course)));
    setMessage(status === "published" ? "Formation publiee en mode test." : status === "archived" ? "Formation archivee en mode test." : "Formation repassee en brouillon.");
  };

  const duplicateCourse = (id: string) => {
    const source = courses.find((course) => course.id === id);
    if (!source) return;
    setCourses((current) => [{ ...source, id: `local-${Date.now()}`, title: `${source.title} - copie`, status: "draft", progress: 20 }, ...current]);
    setMessage("Copie creee en brouillon.");
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
                Gere les ressources de formation que vous avez creees ou publiees.
              </p>
            </div>
            <Link to="/formations" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
              <Plus size={17} /> Catalogue formations
            </Link>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Formations" value={courses.length} icon={GraduationCap} />
          <StatCard label="Publiees" value={courses.filter((course) => course.status === "published").length} icon={Upload} />
          <StatCard label="Apprenants" value={courses.reduce((sum, course) => sum + course.students, 0)} icon={PlayCircle} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["all", "Toutes"],
            ["published", "Publiees"],
            ["draft", "Brouillons"],
            ["archived", "Archivees"],
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

        {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <GraduationCap className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune formation dans ce filtre</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Changez le filtre ou creez une nouvelle ressource.</p>
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
                      <span>Completude</span><span>{course.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[var(--brand-surface-alt)]">
                      <div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/formations/$id" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <Eye size={15} /> Apercu
                    </Link>
                    <Link to="/formations/$id/apprendre" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <PlayCircle size={15} /> Apprendre
                    </Link>
                    <button type="button" onClick={() => updateStatus(course.id, course.status === "published" ? "draft" : "published")} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                      <Upload size={15} /> {course.status === "published" ? "Depublier" : "Publier"}
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