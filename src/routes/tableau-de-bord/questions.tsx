import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, MessageSquare, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AppRole } from "@/lib/auth/AuthContext";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { questions } from "@/data/questions";
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
  const [items, setItems] = useState(questions);
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [message, setMessage] = useState("");

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
    setItems((current) => current.map((question) => (question.id === id ? { ...question, followed: !question.followed } : question)));
    setMessage("Suivi de la question mis à jour.");
  };

  const markResolved = (id: string) => {
    setItems((current) => current.map((question) => (question.id === id ? { ...question, resolved: true } : question)));
    setMessage("Question marquée comme résolue.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Communauté</p>
              <h1 className="mt-2 text-[32px] md:text-[42px]">Mes questions</h1>
              <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                Suivez vos questions publiées dans le forum, les réponses et les votes.
              </p>
            </div>
            <Link to="/forum/nouvelle-question" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
              <Plus size={17} /> Poser une question
            </Link>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Questions" value={items.length} icon={MessageSquare} />
          <StatCard label="Résolues" value={items.filter((question) => question.resolved).length} icon={CheckCircle2} />
          <StatCard label="Vues" value={items.reduce((sum, question) => sum + question.views, 0)} icon={Eye} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["all", "Toutes"],
            ["open", "Ouvertes"],
            ["resolved", "Résolues"],
            ["followed", "Suivies"],
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
              <MessageSquare className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune question dans ce filtre</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Posez une nouvelle question ou changez le filtre.</p>
            </div>
          )}

          {filtered.map((question) => (
            <article key={question.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${question.resolved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {question.resolved ? "Résolue" : "Ouverte"}
                    </span>
                    <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">{question.category}</span>
                  </div>
                  <h2 className="mt-3 text-[18px] font-bold">{question.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{question.excerpt}</p>
                  <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
                    {question.answers} réponse(s) - {question.votes} vote(s) - {question.views} vue(s)
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to="/forum/$id" params={{ id: question.id }} className="inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                    Voir
                  </Link>
                  <button type="button" onClick={() => toggleFollow(question.id)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                    <Star size={15} /> {question.followed ? "Suivie" : "Suivre"}
                  </button>
                  <button
                    type="button"
                    onClick={() => markResolved(question.id)}
                    disabled={question.resolved}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} /> Résoudre
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof MessageSquare }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[28px] font-extrabold">{value.toLocaleString("fr-FR")}</p>
    </div>
  );
}