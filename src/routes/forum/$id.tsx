import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  FileText,
  Flag,
  Image as ImageIcon,
  MessageCircle,
  Paperclip,
  Star,
} from "lucide-react";
import { questions } from "@/data/questions";

export const Route = createFileRoute("/forum/$id")({
  head: () => ({ meta: [{ title: "Question forum - IWOSAN" }] }),
  component: QuestionDetail,
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function QuestionDetail() {
  const { id } = Route.useParams();
  const question = questions.find((item) => item.id === id) ?? questions[0];
  const sortedAnswers = useMemo(
    () => [...(question.answerItems ?? [])].sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes),
    [question.answerItems],
  );
  const [questionVotes, setQuestionVotes] = useState(question.votes);
  const [answerVotes, setAnswerVotes] = useState<Record<string, number>>({});
  const [followed, setFollowed] = useState(Boolean(question.followed));
  const [reported, setReported] = useState(false);
  const [reportedAnswerIds, setReportedAnswerIds] = useState<string[]>([]);
  const [acceptedAnswerId, setAcceptedAnswerId] = useState(sortedAnswers.find((answerItem) => answerItem.accepted)?.id ?? "");
  const [answer, setAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const voteAnswer = (answerId: string, initialVotes: number, delta: number) => {
    setAnswerVotes((current) => ({
      ...current,
      [answerId]: (current[answerId] ?? initialVotes) + delta,
    }));
  };

  const reportAnswer = (answerId: string) => {
    setReportedAnswerIds((current) => (current.includes(answerId) ? current : [...current, answerId]));
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <Link to="/forum" className="text-[13px] font-semibold text-[var(--brand-primary)]">
            Retour au forum
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded bg-[var(--brand-primary-subtle)] px-2 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
              {question.category}
            </span>
            {question.subcategory && (
              <span className="rounded bg-[var(--brand-surface-alt)] px-2 py-1 text-[12px] font-semibold">
                {question.subcategory}
              </span>
            )}
            {question.resolved && (
              <span className="rounded bg-emerald-50 px-2 py-1 text-[12px] font-bold text-emerald-700">Repondue</span>
            )}
            {question.featured && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[12px] font-bold text-amber-700">
                <Star size={13} /> Vedette
              </span>
            )}
          </div>
          <h1 className="mt-4 max-w-4xl text-[30px] leading-tight md:text-[44px]">{question.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-[var(--color-text-muted)]">
            <img
              src={question.authorAvatar ?? "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80"}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-semibold text-[var(--color-text-primary)]">{question.authorName}</span>
            <span>{question.authorReputation ?? 0} pts</span>
            <span>{formatDate(question.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={14} /> {question.views} vues
            </span>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-8 lg:grid-cols-[88px_1fr_280px]">
        <aside className="flex gap-3 lg:flex-col">
          <button
            type="button"
            onClick={() => setQuestionVotes((current) => current + 1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white"
            aria-label="Voter pour"
          >
            <ArrowUp size={18} />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[15px] font-bold text-white">
            {questionVotes}
          </div>
          <button
            type="button"
            onClick={() => setQuestionVotes((current) => current - 1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white"
            aria-label="Voter contre"
          >
            <ArrowDown size={18} />
          </button>
        </aside>

        <div className="space-y-6">
          <article className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <div
              className="prose max-w-none text-[var(--color-text-secondary)]"
              dangerouslySetInnerHTML={{ __html: question.body ?? question.excerpt }}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">
                  #{tag}
                </span>
              ))}
            </div>

            {question.attachments && question.attachments.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
                  <Paperclip size={16} /> Pieces jointes
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.attachments.map((attachment) =>
                    attachment.type === "image" ? (
                      <a key={attachment.id} href={attachment.url} className="group overflow-hidden rounded-lg border border-[var(--brand-border)]">
                        <img src={attachment.url} alt={attachment.name} className="h-44 w-full object-cover transition group-hover:scale-105" />
                        <span className="flex items-center gap-2 p-3 text-[13px] font-semibold">
                          <ImageIcon size={15} /> {attachment.name}
                        </span>
                      </a>
                    ) : (
                      <a key={attachment.id} href={attachment.url} className="flex items-center gap-3 rounded-lg border border-[var(--brand-border)] p-4 text-[13px] font-semibold">
                        <FileText size={18} /> {attachment.name}
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}
          </article>

          <section className="space-y-4">
            <h2 className="text-[24px] font-bold">{sortedAnswers.length} reponses</h2>
            {sortedAnswers.map((item) => {
              const accepted = acceptedAnswerId === item.id;
              const itemReported = reportedAnswerIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className={`rounded-[12px] border bg-white p-5 ${
                    accepted ? "border-emerald-300 ring-2 ring-emerald-100" : "border-[var(--brand-border-light)]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex gap-2 sm:flex-col">
                      <button type="button" onClick={() => voteAnswer(item.id, item.votes, 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)]" aria-label="Voter pour cette reponse">
                        <ArrowUp size={15} />
                      </button>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-surface-alt)] text-[13px] font-bold">
                        {answerVotes[item.id] ?? item.votes}
                      </span>
                      <button type="button" onClick={() => voteAnswer(item.id, item.votes, -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)]" aria-label="Voter contre cette reponse">
                        <ArrowDown size={15} />
                      </button>
                    </div>
                    <div className="flex-1">
                      {accepted && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                          <Check size={14} /> Reponse acceptee
                        </div>
                      )}
                      <p className="leading-7 text-[var(--color-text-secondary)]">{item.body}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                        <img src={item.authorAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <strong className="text-[var(--color-text-primary)]">{item.authorName}</strong>
                        <span>{item.authorReputation} pts</span>
                        <span>{formatDate(item.date)}</span>
                        <button type="button" onClick={() => reportAnswer(item.id)} className="inline-flex items-center gap-1 font-semibold">
                          <Flag size={13} /> {itemReported ? "Signalee" : "Signaler"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAcceptedAnswerId(item.id)}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                        >
                          <Check size={13} /> Accepter cette reponse
                        </button>
                      </div>
                      {itemReported && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">Signalement de la reponse enregistre en mock.</p>}
                      {item.comments.length > 0 && (
                        <div className="mt-4 space-y-2 rounded-lg bg-[var(--brand-surface-alt)] p-3">
                          {item.comments.map((comment) => (
                            <p key={comment.id} className="text-[13px] text-[var(--color-text-secondary)]">
                              <strong>{comment.authorName}</strong> : {comment.content}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold">
              <MessageCircle size={20} /> Repondre
            </h2>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setAnswerSubmitted(false);
              }}
              rows={6}
              placeholder="Redigez une reponse argumentee, prudente et utile..."
              className="mt-4 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                <Paperclip size={15} /> Ajouter une image
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnswerSubmitted(true);
                  setAnswer("");
                }}
                disabled={answer.trim().length < 20}
                className="h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                Publier la reponse
              </button>
            </div>
            {answerSubmitted && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">
                Reponse ajoutee en mock. Elle sera sauvegardee apres la liaison API.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <button
            type="button"
            onClick={() => setFollowed((current) => !current)}
            className={`h-11 w-full rounded-full text-[13px] font-semibold ${
              followed ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)]"
            }`}
          >
            {followed ? "Question suivie" : "Suivre"}
          </button>
          <button
            type="button"
            onClick={() => setReported(true)}
            className="h-11 w-full rounded-full border border-[var(--brand-border)] text-[13px] font-semibold"
          >
            {reported ? "Signalee" : "Signaler"}
          </button>
          {reported && <p className="rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">Signalement enregistre en mock.</p>}
          <div className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[12px] text-[var(--color-text-muted)]">
            Actions auteur/admin mock : modifier, fermer, rouvrir et supprimer seront branchees en section API.
          </div>
        </aside>
      </section>
    </main>
  );
}