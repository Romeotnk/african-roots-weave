import type { Question } from "@/types";
import { ArrowUp, MessageCircle, Eye, CheckCircle2 } from "lucide-react";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="bg-white rounded-[12px] border border-[var(--brand-border)] p-5 hover:border-[var(--brand-primary)] transition flex gap-5">
      <div className="hidden sm:flex flex-col items-center text-center gap-3 w-16 shrink-0">
        <div>
          <div className="text-[var(--color-text-muted)]">
            <ArrowUp size={18} />
          </div>
          <div className="text-[15px] font-bold">{question.votes}</div>
        </div>
        <div
          className={`text-[11px] font-bold rounded px-2 py-1 ${question.resolved ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
        >
          {question.answers} rép.
        </div>
        <div className="text-[11px] text-[var(--color-text-muted)] inline-flex items-center gap-1">
          <Eye size={11} /> {question.views}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-2 py-1 rounded">
            {question.category}
          </span>
          {question.resolved && <CheckCircle2 size={14} className="text-green-600" />}
        </div>
        <h3 className="text-[16px] font-semibold leading-snug mb-2 hover:text-[var(--brand-primary)] cursor-pointer">
          {question.title}
        </h3>
        <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2 mb-3">
          {question.excerpt}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {question.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"
              >
                #{t}
              </span>
            ))}
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)] inline-flex items-center gap-2 sm:hidden">
            <MessageCircle size={12} /> {question.answers} · ↑ {question.votes}
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)]">
            par {question.authorName} · {question.date}
          </div>
        </div>
      </div>
    </article>
  );
}
