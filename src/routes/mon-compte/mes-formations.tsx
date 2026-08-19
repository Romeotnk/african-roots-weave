import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, GraduationCap, Loader2, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/shared/StatCard";
import { useMyFormationEnrollments } from "@/hooks/useEventsFormationsApi";

export const Route = createFileRoute("/mon-compte/mes-formations")({
  head: () => ({ meta: [{ title: "Mon apprentissage - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <MesFormationsPage />
    </ProtectedRoute>
  ),
});

function MesFormationsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMyFormationEnrollments();
  const enrollments = data ?? [];
  const inProgressCount = enrollments.filter((item) => item.progressPercent > 0 && item.progressPercent < 100).length;
  const completedCount = enrollments.filter((item) => item.progressPercent >= 100).length;

  return (
    <AccountLayout title={t("account.myLearning.title")} description={t("account.myLearning.description")}>
      {isLoading ? (
        <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
          <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
        </div>
      ) : isError ? (
        <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
          {t("account.myLearning.loadError")}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
          <GraduationCap className="mx-auto text-[var(--brand-primary)]" size={34} />
          <h2 className="mt-4 text-[20px] font-bold">{t("account.myLearning.emptyTitle")}</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("account.myLearning.emptyDesc")}</p>
          <Link to="/formations" className="btn-primary mt-5 inline-flex h-11 px-6 text-[14px]">
            {t("account.myLearning.browseFormations")}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard icon={PlayCircle} label={t("account.myLearning.statInProgress")} value={inProgressCount} tone="warning" />
            <StatCard icon={CheckCircle2} label={t("account.myLearning.statCompleted")} value={completedCount} tone="success" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => (
              <article key={enrollment.id} className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
                <div className="aspect-[16/9] w-full bg-[var(--brand-surface-alt)]">
                  {enrollment.formation.coverImage ? (
                    <img src={enrollment.formation.coverImage} alt={enrollment.formation.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <GraduationCap className="text-[var(--brand-primary)]" size={32} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--brand-primary)]">{enrollment.formation.category}</p>
                  <h2 className="mt-1 line-clamp-2 text-[15px] font-bold text-[var(--color-text-primary)]">{enrollment.formation.title}</h2>
                  <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                    {t("account.myLearning.byInstructor", { name: `${enrollment.formation.createdBy.firstName} ${enrollment.formation.createdBy.lastName}` })}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--color-text-secondary)]">
                      <span>{t("account.myLearning.progress")}</span>
                      <span>{enrollment.progressPercent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--brand-surface-alt)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${enrollment.progressPercent}%`, backgroundColor: enrollment.progressPercent >= 100 ? "var(--brand-success)" : "var(--brand-primary)" }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/formations/$id/apprendre"
                    params={{ id: enrollment.formation.id }}
                    className="btn-primary mt-4 h-10 w-full text-[13px]"
                  >
                    <PlayCircle size={16} /> {enrollment.progressPercent >= 100 ? t("account.myLearning.review") : t("account.myLearning.continue")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </AccountLayout>
  );
}
