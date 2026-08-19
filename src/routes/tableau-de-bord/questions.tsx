import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, Loader2, MessageSquare, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AppRole } from "@/lib/auth/AuthContext";
import { AccountLayout } from "@/components/account/AccountLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useMyFavorites, useMyForumQuestions, useToggleFavorite } from "@/hooks/useForumApi";
import { toQuestion, type BackendQuestion } from "@/lib/forumMappers";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";

export const Route = createFileRoute("/tableau-de-bord/questions")({
  head: () => ({ meta: [{ title: "Mes questions - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={PROFESSIONAL_ACCOUNT_ROLES}>
      <QuestionsPage />
    </ProtectedRoute>
  ),
});

type QuestionFilter = "all" | "open" | "resolved" | "followed";

export function QuestionsPage({ allowedRoles = PROFESSIONAL_ACCOUNT_ROLES }: { allowedRoles?: AppRole[] } = {}) {
  const { t } = useTranslation();
  const myQuestionsQuery = useMyForumQuestions();
  const apiQuestions = useMemo(
    () => ((myQuestionsQuery.data?.questions ?? []) as BackendQuestion[]).map(toQuestion).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [myQuestionsQuery.data],
  );
  const favoritesQuery = useMyFavorites("QUESTION");
  const toggleFavorite = useToggleFavorite();
  const followedIds = useMemo(
    () => new Set(((favoritesQuery.data ?? []) as { id?: string }[]).map((item) => item.id).filter((id): id is string => Boolean(id))),
    [favoritesQuery.data],
  );
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [message, setMessage] = useState("");
  const items = apiQuestions.map((question) => ({
    ...question,
    followed: followedIds.has(question.id),
  }));

  const filtered = useMemo(
    () =>
      items.filter((question) => {
        if (filter === "open") return !question.resolved;
        if (filter === "resolved") return question.resolved;
        if (filter === "followed") return question.followed;
        return true;
      }),
    [filter, items],
  );

  const toggleFollow = (id: string) => {
    const wasFollowed = followedIds.has(id);
    toggleFavorite.mutate(
      { targetId: id, targetType: "QUESTION" },
      {
        onSuccess: () => setMessage(wasFollowed ? t("dashboard.myQuestions.unfollowed") : t("dashboard.myQuestions.followed")),
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myQuestions.actionError")),
      },
    );
  };

  return (
    <AccountLayout
      title={t("dashboard.myQuestions.title")}
      description={t("dashboard.myQuestions.description")}
      actions={
        <Link to="/forum/nouvelle-question" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
          <Plus size={17} /> {t("dashboard.myQuestions.askQuestion")}
        </Link>
      }
    >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label={t("dashboard.myQuestions.statQuestions")} value={items.length} icon={MessageSquare} />
          <StatCard label={t("dashboard.myQuestions.statResolved")} value={items.filter((question) => question.resolved).length} icon={CheckCircle2} />
          <StatCard label={t("dashboard.myQuestions.statViews")} value={items.reduce((sum, question) => sum + question.views, 0)} icon={Eye} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["all", t("dashboard.myQuestions.filterAll")],
            ["open", t("dashboard.myQuestions.filterOpen")],
            ["resolved", t("dashboard.myQuestions.filterResolved")],
            ["followed", t("dashboard.myQuestions.filterFollowed")],
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
          {myQuestionsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : myQuestionsQuery.isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              {t("dashboard.myQuestions.loadError")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <MessageSquare className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">{t("dashboard.myQuestions.emptyTitle")}</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.myQuestions.emptyDesc")}</p>
            </div>
          ) : (
          filtered.map((question) => (
            <article key={question.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${question.resolved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {question.resolved ? t("dashboard.myQuestions.statusResolved") : t("dashboard.myQuestions.statusOpen")}
                    </span>
                    <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">{question.category}</span>
                  </div>
                  <h2 className="mt-3 text-[18px] font-bold">{question.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{question.excerpt}</p>
                  <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
                    {t("dashboard.myQuestions.answersVotesViews", { answers: question.answers, votes: question.votes, views: question.views })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to="/forum/$id" params={{ id: question.id }} className="inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                    {t("dashboard.myQuestions.view")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFollow(question.id)}
                    disabled={toggleFavorite.isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:opacity-50"
                  >
                    <Star size={15} className={question.followed ? "fill-current" : ""} /> {question.followed ? t("dashboard.myQuestions.unfollow") : t("dashboard.myQuestions.follow")}
                  </button>
                  {!question.resolved && (
                    <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-surface-alt)] px-4 text-[12px] text-[var(--color-text-muted)]">
                      <CheckCircle2 size={15} /> {t("dashboard.myQuestions.resolveHint")}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
          )}
        </div>
    </AccountLayout>
  );
}

