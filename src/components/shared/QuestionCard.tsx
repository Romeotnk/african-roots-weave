import { Link } from "@tanstack/react-router";
import { ArrowUp, Award, CheckCircle2, Eye, MessageCircle, Star } from "lucide-react";
import type { Question } from "@/types";

function formatQuestionDate(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="flex gap-5 rounded-[12px] border border-[var(--brand-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--brand-primary)]">
      <div className="hidden w-16 shrink-0 flex-col items-center gap-3 text-center sm:flex">
        <div>
          <div className="text-[var(--color-text-muted)]">
            <ArrowUp size={18} />
          </div>
          <div className="text-[15px] font-bold">{question.votes}</div>
        </div>
        <div
          className={`rounded px-2 py-1 text-[11px] font-bold ${
            question.resolved
              ? "bg-[var(--brand-success)]/15 text-[var(--brand-success)]"
              : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"
          }`}
        >
          {question.answers} rep.
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
          <Eye size={11} /> {question.views}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-[var(--brand-primary-subtle)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-primary)]">
            {question.subcategory ? `${question.category} > ${question.subcategory}` : question.category}
          </span>
          {question.resolved && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 size={13} /> Repondue
            </span>
          )}
          {question.featured && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
              <Star size={13} /> Vedette
            </span>
          )}
        </div>

        <Link
          to="/forum/$id"
          params={{ id: question.id }}
          className="mb-2 block text-[16px] font-semibold leading-snug text-[var(--color-text-primary)] hover:text-[var(--brand-primary)]"
        >
          {question.title}
        </Link>

        <p className="mb-3 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">{question.excerpt}</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--brand-surface-alt)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--color-text-muted)] sm:hidden">
            <MessageCircle size={12} /> {question.answers} · up {question.votes}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
            <img
              src={question.authorAvatar ?? "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80"}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
            <span>par {question.authorName}</span>
            <span className="inline-flex items-center gap-1">
              <Award size={12} /> {question.authorReputation ?? 0}
            </span>
            <span>{formatQuestionDate(question.date)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
