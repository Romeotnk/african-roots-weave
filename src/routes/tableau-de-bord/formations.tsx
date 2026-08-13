import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, GraduationCap, Loader2, PlayCircle, Plus, Search, Upload, Users, Wallet } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useCreateFormation, useMyFormations, useUpdateFormation } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourses } from "@/lib/mappers/formation";
import type { TrainingCourse } from "@/types";

export const Route = createFileRoute("/tableau-de-bord/formations")({
  head: () => ({ meta: [{ title: "Mes formations - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <TrainingsDashboard />
    </ProtectedRoute>
  ),
});

type CourseStatus = "published" | "draft";
type LocalCourse = TrainingCourse & { status: CourseStatus; enrollmentCount: number; revenue: number };

type CourseForm = {
  title: string;
  category: string;
  level: TrainingCourse["level"];
  duration: string;
  price: string;
};

function buildEmptyCourseForm(t: (key: string) => string): CourseForm {
  return {
    title: "",
    category: t("dashboard.myFormations.initialCategoryValue"),
    level: "Debutant",
    duration: "2h",
    price: "0",
  };
}

function TrainingsDashboard() {
  const { t } = useTranslation();
  const emptyCourseForm = buildEmptyCourseForm(t);
  const statusLabels: Record<CourseStatus, string> = {
    published: t("dashboard.myFormations.statusPublished"),
    draft: t("dashboard.myFormations.statusDraft"),
  };
  const myFormationsQuery = useMyFormations();
  const createFormation = useCreateFormation();
  const updateFormation = useUpdateFormation();

  const courses: LocalCourse[] = useMemo(() => {
    const raw = (myFormationsQuery.data?.formations ?? []) as {
      isPublished?: boolean;
      enrollmentCount?: number;
      revenue?: number | string;
    }[];
    return toTrainingCourses(raw).map((course, index) => ({
      ...course,
      status: raw[index]?.isPublished ? "published" : "draft",
      enrollmentCount: raw[index]?.enrollmentCount ?? 0,
      revenue: Number(raw[index]?.revenue ?? 0),
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
        onSuccess: (updated) => {
          // The server silently keeps isPublished:false for professional
          // accounts (only SUPER_ADMIN/ADMIN can truly publish) — read the
          // record it actually persisted instead of assuming the request succeeded
          // as-requested, so this message never claims "published" when it isn't.
          const actuallyPublished = Boolean((updated as { isPublished?: boolean } | null)?.isPublished);
          setMessage(
            status === "published" && !actuallyPublished
              ? t("dashboard.myFormations.submittedForReview")
              : actuallyPublished
                ? t("dashboard.myFormations.published")
                : t("dashboard.myFormations.backToDraft"),
          );
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myFormations.actionError")),
      },
    );
  };

  const createCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const price = Number(form.price);

    if (title.length < 6) {
      setMessage(t("dashboard.myFormations.titleTooShort"));
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setMessage(t("dashboard.myFormations.priceInvalid"));
      return;
    }

    createFormation.mutate(
      {
        title,
        type: "DOCUMENT",
        fileUrl: "",
        category: form.category.trim() || t("dashboard.myFormations.defaultCategory"),
        level: form.level,
        duration: form.duration.trim() || "2h",
        price,
        currency: "XOF",
        prerequisites: [t("dashboard.myFormations.prerequisiteTodo")],
        learnings: [t("dashboard.myFormations.learningTodo")],
        isPublished: false,
      },
      {
        onSuccess: () => {
          setForm(emptyCourseForm);
          setShowForm(false);
          setMessage(t("dashboard.myFormations.created"));
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myFormations.createError")),
      },
    );
  };

  return (
    <AccountLayout
      title={t("dashboard.myFormations.title")}
      description={t("dashboard.myFormations.description")}
      actions={
        <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
          <Plus size={17} /> {showForm ? t("dashboard.myFormations.close") : t("dashboard.myFormations.newFormation")}
        </button>
      }
    >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label={t("dashboard.myFormations.statFormations")} value={courses.length} icon={GraduationCap} />
          <StatCard label={t("dashboard.myFormations.statPublished")} value={courses.filter((course) => course.status === "published").length} icon={Upload} />
          <StatCard label={t("dashboard.myFormations.statEnrolled")} value={courses.reduce((sum, course) => sum + course.enrollmentCount, 0)} icon={Users} />
          <StatCard
            label={t("dashboard.myFormations.statRevenue")}
            value={courses.reduce((sum, course) => sum + course.revenue, 0)}
            icon={Wallet}
            suffix=" FCFA"
          />
        </div>

        {showForm && (
          <form onSubmit={createCourse} className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-5">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={t("dashboard.myFormations.titlePlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px] md:col-span-2" />
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder={t("dashboard.myFormations.categoryPlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as TrainingCourse["level"] }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]">
                <option value="Debutant">{t("dashboard.myFormations.levelBeginner")}</option>
                <option value="Intermediaire">{t("dashboard.myFormations.levelIntermediate")}</option>
                <option value="Avance">{t("dashboard.myFormations.levelAdvanced")}</option>
              </select>
              <button type="submit" disabled={createFormation.isPending} className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-gold)] px-5 text-[13px] font-bold text-[var(--color-text-primary)] disabled:opacity-50">
                {createFormation.isPending ? t("dashboard.myFormations.creating") : t("dashboard.myFormations.create")}
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder={t("dashboard.myFormations.durationPlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} inputMode="numeric" placeholder={t("dashboard.myFormations.pricePlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
            </div>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("dashboard.myFormations.searchPlaceholder")} className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", t("dashboard.myFormations.all")],
              ["published", t("dashboard.myFormations.filterPublished")],
              ["draft", t("dashboard.myFormations.filterDrafts")],
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
              {t("dashboard.myFormations.loadError")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <GraduationCap className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">{t("dashboard.myFormations.emptyTitle")}</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.myFormations.emptyDesc")}</p>
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
                      <p className="mt-1 text-[13px] font-semibold text-[var(--brand-primary)]">
                        {t("dashboard.myFormations.enrolled", { count: course.enrollmentCount })} · {course.revenue.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <p className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
                      {course.price === 0 ? t("dashboard.myFormations.free") : `${course.price.toLocaleString("fr-FR")} ${course.currency}`}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/formations/$id" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <Eye size={15} /> {t("dashboard.myFormations.preview")}
                    </Link>
                    <Link to="/formations/$id/apprendre" params={{ id: course.id }} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                      <PlayCircle size={15} /> {t("dashboard.myFormations.learn")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => updateStatus(course.id, course.status === "published" ? "draft" : "published")}
                      disabled={updateFormation.isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                    >
                      <Upload size={15} /> {course.status === "published" ? t("dashboard.myFormations.unpublish") : t("dashboard.myFormations.publish")}
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

function StatCard({ label, value, icon: Icon, suffix }: { label: string; value: number; icon: typeof GraduationCap; suffix?: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[28px] font-extrabold">{value.toLocaleString("fr-FR")}{suffix}</p>
    </div>
  );
}
