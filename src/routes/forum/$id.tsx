import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Flag,
  MessageCircle,
  Star,
} from "lucide-react";
import { questions } from "@/data/questions";
import { useAcceptForumAnswer, useCreateForumAnswer, useForumQuestion, useForumReport, useForumVote } from "@/hooks/useForumApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { toQuestion, type BackendQuestion } from "@/lib/forumMappers";

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
  const { user } = useAuth();
  const questionQuery = useForumQuestion(id);
  const voteMutation = useForumVote();
  const answerMutation = useCreateForumAnswer();
  const acceptMutation = useAcceptForumAnswer();
  const reportMutation = useForumReport();

  const apiQuestion = useMemo(() => {
    const data = questionQuery.data as (BackendQuestion & { authorId?: string }) | undefined;
    return data ? toQuestion(data) : null;
  }, [questionQuery.data]);
  const question = apiQuestion ?? questions.find((item) => item.id === id) ?? questions[0];
  const isRealQuestion = Boolean(apiQuestion);
  const isAuthor = isRealQuestion && Boolean(user) && question.authorId === user?.id;

  const sortedAnswers = useMemo(
    () => [...(question.answerItems ?? [])].sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes),
    [question.answerItems],
  );
  const [followed, setFollowed] = useState(Boolean(question.followed));
  const [reported, setReported] = useState(false);
  const [reportedAnswerIds, setReportedAnswerIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const voteQuestion = (value: 1 | -1) => {
    if (!isRealQuestion) return;
    voteMutation.mutate({ targetId: id, targetType: "QUESTION", value });
  };

  const voteAnswer = (answerId: string, value: 1 | -1) => {
    if (!isRealQuestion) return;
    voteMutation.mutate({ targetId: answerId, targetType: "ANSWER", value });
  };

  const acceptAnswerAction = (answerId: string) => {
    if (!isRealQuestion) return;
    acceptMutation.mutate(answerId);
  };

  const reportAnswer = (answerId: string) => {
    setReportedAnswerIds((current) => (current.includes(answerId) ? current : [...current, answerId]));
    if (isRealQuestion) reportMutation.mutate({ targetId: answerId, targetType: "ANSWER" });
  };

  const submitAnswer = () => {
    if (!isRealQuestion) {
      setAnswerSubmitted(true);
      setAnswer("");
      return;
    }
    answerMutation.mutate(
      { questionId: id, payload: { content: answer } },
      { onSuccess: () => { setAnswerSubmitted(true); setAnswer(""); } },
    );
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
              <span className="rounded bg-emerald-50 px-2 py-1 text-[12px] font-bold text-emerald-700">Répondue</span>
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
            onClick={() => voteQuestion(1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white"
            aria-label="Voter pour"
          >
            <ArrowUp size={18} />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[15px] font-bold text-white">
            {question.votes}
          </div>
          <button
            type="button"
            onClick={() => voteQuestion(-1)}
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
          </article>

          <section className="space-y-4">
            <h2 className="text-[24px] font-bold">{sortedAnswers.length} réponses</h2>
            {sortedAnswers.map((item) => {
              const accepted = item.accepted;
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
                      <button type="button" onClick={() => voteAnswer(item.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)]" aria-label="Voter pour cette reponse">
                        <ArrowUp size={15} />
                      </button>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-surface-alt)] text-[13px] font-bold">
                        {item.votes}
                      </span>
                      <button type="button" onClick={() => voteAnswer(item.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)]" aria-label="Voter contre cette reponse">
                        <ArrowDown size={15} />
                      </button>
                    </div>
                    <div className="flex-1">
                      {accepted && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                          <Check size={14} /> Réponse acceptée
                        </div>
                      )}
                      <p className="leading-7 text-[var(--color-text-secondary)]">{item.body}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                        <img src={item.authorAvatar ?? "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80"} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <strong className="text-[var(--color-text-primary)]">{item.authorName}</strong>
                        <span>{item.authorReputation} pts</span>
                        <span>{formatDate(item.date)}</span>
                        <button type="button" onClick={() => reportAnswer(item.id)} className="inline-flex items-center gap-1 font-semibold">
                          <Flag size={13} /> {itemReported ? "Signalée" : "Signaler"}
                        </button>
                        {isAuthor && !accepted && (
                          <button
                            type="button"
                            onClick={() => acceptAnswerAction(item.id)}
                            className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                          >
                            <Check size={13} /> Accepter cette réponse
                          </button>
                        )}
                      </div>
                      {itemReported && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">Signalement de la réponse enregistré.</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold">
              <MessageCircle size={20} /> Répondre
            </h2>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setAnswerSubmitted(false);
              }}
              rows={6}
              placeholder="Rédigez une réponse argumentée, prudente et utile..."
              className="mt-4 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={submitAnswer}
                disabled={answer.trim().length < 20 || answerMutation.isPending}
                className="h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                {answerMutation.isPending ? "Publication..." : "Publier la réponse"}
              </button>
            </div>
            {answerSubmitted && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">
                Réponse publiée. Elle apparaît dans le fil de discussion.
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
            onClick={() => {
              setReported(true);
              if (isRealQuestion) reportMutation.mutate({ targetId: id, targetType: "QUESTION" });
            }}
            className="h-11 w-full rounded-full border border-[var(--brand-border)] text-[13px] font-semibold"
          >
            {reported ? "Signalée" : "Signaler"}
          </button>
          {reported && <p className="rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">Signalement enregistré.</p>}
          <div className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[12px] text-[var(--color-text-muted)]">
            Les actions de modération avancées seront disponibles selon vos droits.
          </div>
        </aside>
      </section>
    </main>
  );
}
