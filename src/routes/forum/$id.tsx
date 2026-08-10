import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Check,
  Eye,
  Flag,
  Loader2,
  MessageCircle,
  Paperclip,
  Pencil,
  Star,
} from "lucide-react";
import { AdSlot } from "@/components/shared/AdSlot";
import {
  useAcceptForumAnswer,
  useCreateForumAnswer,
  useCreateForumComment,
  useForumQuestion,
  useForumReport,
  useForumVote,
  useMyFavorites,
  useToggleFavorite,
  useUpdateForumComment,
  useUploadForumAttachments,
} from "@/hooks/useForumApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { toComments, toQuestion, type BackendQuestion } from "@/lib/forumMappers";
import type { ForumAttachment } from "@/types";

function AttachmentGallery({ attachments }: { attachments?: ForumAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {attachments.map((attachment) =>
        attachment.type === "image" ? (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="block h-20 w-20 overflow-hidden rounded-lg border border-[var(--brand-border-light)]"
          >
            <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
          </a>
        ) : (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px] font-semibold text-[var(--brand-primary)]"
          >
            <Paperclip size={13} /> {attachment.name}
          </a>
        ),
      )}
    </div>
  );
}

const moderatorRoles = ["admin", "super_admin", "moderator"];

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
  const { user, roles } = useAuth();
  const questionQuery = useForumQuestion(id);
  const voteMutation = useForumVote();
  const answerMutation = useCreateForumAnswer();
  const acceptMutation = useAcceptForumAnswer();
  const reportMutation = useForumReport();
  const commentMutation = useCreateForumComment();
  const updateCommentMutation = useUpdateForumComment();
  const favoritesQuery = useMyFavorites("QUESTION");
  const answerFavoritesQuery = useMyFavorites("ANSWER");
  const toggleFavoriteMutation = useToggleFavorite();

  const apiQuestion = useMemo(() => {
    const data = questionQuery.data as (BackendQuestion & { authorId?: string }) | undefined;
    return data ? toQuestion(data) : null;
  }, [questionQuery.data]);
  const comments = useMemo(
    () => toComments((questionQuery.data as BackendQuestion | undefined)?.comments),
    [questionQuery.data],
  );

  useEffect(() => {
    if (apiQuestion?.title) document.title = `${apiQuestion.title} - IWOSAN`;
  }, [apiQuestion?.title]);
  const isModerator = roles.some((role) => moderatorRoles.includes(role));
  const isFavorited = ((favoritesQuery.data ?? []) as { id: string }[]).some((item) => item.id === id);
  const favoritedAnswerIds = new Set(
    ((answerFavoritesQuery.data ?? []) as { id: string }[]).map((item) => item.id),
  );
  const isFavoriteTogglePending = (targetId: string) =>
    toggleFavoriteMutation.isPending && toggleFavoriteMutation.variables?.targetId === targetId;

  const sortedAnswers = useMemo(
    () => [...(apiQuestion?.answerItems ?? [])].sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes),
    [apiQuestion],
  );
  const [reported, setReported] = useState(false);
  const [reportedAnswerIds, setReportedAnswerIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerAttachments, setAnswerAttachments] = useState<string[]>([]);
  const [answerAttachmentNotice, setAnswerAttachmentNotice] = useState("");
  const answerAttachmentInputRef = useRef<HTMLInputElement>(null);
  const uploadAnswerAttachments = useUploadForumAttachments();
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const voteQuestion = (value: 1 | -1) => {
    voteMutation.mutate({ targetId: id, targetType: "QUESTION", value });
  };

  const voteComment = (commentId: string, value: 1 | -1) => {
    voteMutation.mutate({ targetId: commentId, targetType: "COMMENT", value });
  };

  const startEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentContent);
  };

  const submitEditComment = () => {
    if (!editingCommentId || editingCommentText.trim().length < 3) return;
    updateCommentMutation.mutate(
      { id: editingCommentId, content: editingCommentText.trim() },
      { onSuccess: () => setEditingCommentId(null) },
    );
  };

  const voteAnswer = (answerId: string, value: 1 | -1) => {
    voteMutation.mutate({ targetId: answerId, targetType: "ANSWER", value });
  };

  const acceptAnswerAction = (answerId: string) => {
    acceptMutation.mutate(answerId);
  };

  const reportAnswer = (answerId: string) => {
    reportMutation.mutate(
      { targetId: answerId, targetType: "ANSWER" },
      { onSuccess: () => setReportedAnswerIds((current) => (current.includes(answerId) ? current : [...current, answerId])) },
    );
  };

  const favoriteAnswer = (answerId: string) => {
    toggleFavoriteMutation.mutate({ targetId: answerId, targetType: "ANSWER" });
  };

  const submitComment = () => {
    setCommentError("");
    if (commentText.trim().length < 3) {
      setCommentError("Le commentaire doit contenir au moins 3 caractères.");
      return;
    }
    commentMutation.mutate(
      { targetId: id, targetType: "QUESTION", content: commentText.trim() },
      { onSuccess: () => setCommentText("") },
    );
  };

  const submitAnswer = () => {
    answerMutation.mutate(
      { questionId: id, payload: { content: answer, attachments: answerAttachments } },
      { onSuccess: () => { setAnswerSubmitted(true); setAnswer(""); setAnswerAttachments([]); } },
    );
  };

  // Only render interactive question content once it's genuinely loaded from
  // the API — never fall back to demo/mock content on a loading or error
  // state, since every vote/answer/report action below assumes a real
  // question id exists to act on.
  if (questionQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={32} />
      </main>
    );
  }

  if (!apiQuestion) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--brand-bg)] px-4 text-center">
        <h1 className="text-[24px] font-bold">Question introuvable</h1>
        <p className="max-w-md text-[14px] text-[var(--color-text-muted)]">
          Cette question n'existe pas ou n'est plus disponible.
        </p>
        <Link to="/forum" className="text-[14px] font-semibold text-[var(--brand-primary)]">
          Retour au forum
        </Link>
      </main>
    );
  }

  const question = apiQuestion;
  const isAuthor = Boolean(user) && question.authorId === user?.id;

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
            <AttachmentGallery attachments={question.attachments} />
            <div className="mt-5 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">
                  #{tag}
                </span>
              ))}
            </div>

            {(
              <div className="mt-6 border-t border-[var(--brand-border-light)] pt-5">
                <h3 className="flex items-center gap-2 text-[15px] font-bold">
                  <MessageCircle size={16} /> {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </h3>
                <div className="mt-3 space-y-3">
                  {comments.map((comment) => {
                    const canEditComment = Boolean(user) && (comment.authorId === user?.id || isModerator);
                    return (
                      <div key={comment.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
                            <strong className="text-[var(--color-text-primary)]">{comment.authorName}</strong>
                            <span>{formatDate(comment.date)}</span>
                          </div>
                          {canEditComment && editingCommentId !== comment.id && (
                            <button
                              type="button"
                              onClick={() => startEditComment(comment.id, comment.content)}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                            >
                              <Pencil size={12} /> Modifier
                            </button>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <input
                              value={editingCommentText}
                              onChange={(event) => setEditingCommentText(event.target.value)}
                              className="h-9 flex-1 rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={submitEditComment}
                                disabled={updateCommentMutation.isPending}
                                className="h-9 rounded-full bg-[var(--brand-primary)] px-3 text-[12px] font-semibold text-white disabled:opacity-50"
                              >
                                Enregistrer
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="h-9 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-[var(--color-text-secondary)]">{comment.content}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" onClick={() => voteComment(comment.id, 1)} aria-label="Voter pour ce commentaire" className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--brand-border)]">
                            <ArrowUp size={12} />
                          </button>
                          <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">{comment.votes}</span>
                          <button type="button" onClick={() => voteComment(comment.id, -1)} aria-label="Voter contre ce commentaire" className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--brand-border)]">
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={commentText}
                    onChange={(event) => {
                      setCommentText(event.target.value);
                      setCommentError("");
                    }}
                    placeholder="Ajouter un commentaire..."
                    className="h-10 flex-1 rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={commentMutation.isPending}
                    className="h-10 shrink-0 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                  >
                    Commenter
                  </button>
                </div>
                {commentError && <p className="mt-2 text-[12px] font-semibold text-red-700">{commentError}</p>}
              </div>
            )}
          </article>

          <section className="space-y-4">
            <h2 className="text-[24px] font-bold">{sortedAnswers.length} réponses</h2>
            {sortedAnswers.map((item) => {
              const accepted = item.accepted;
              const itemReported = reportedAnswerIds.includes(item.id);
              const itemFavorited = favoritedAnswerIds.has(item.id);
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
                      <AttachmentGallery attachments={item.attachments} />
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                        <img src={item.authorAvatar ?? "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80"} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <strong className="text-[var(--color-text-primary)]">{item.authorName}</strong>
                        <span>{item.authorReputation} pts</span>
                        <span>{formatDate(item.date)}</span>
                        <button
                          type="button"
                          disabled={isFavoriteTogglePending(item.id)}
                          onClick={() => favoriteAnswer(item.id)}
                          className={`inline-flex items-center gap-1 font-semibold disabled:opacity-50 ${itemFavorited ? "text-[var(--brand-primary)]" : ""}`}
                        >
                          <Bookmark size={13} className={itemFavorited ? "fill-current" : undefined} /> {itemFavorited ? "Dans mes favoris" : "Favori"}
                        </button>
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
            <input
              ref={answerAttachmentInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (files.length === 0) return;
                setAnswerAttachmentNotice("");
                uploadAnswerAttachments.mutate(files, {
                  onSuccess: (urls) => {
                    setAnswerAttachments((current) => [...current, ...urls]);
                    setAnswerAttachmentNotice(`${urls.length} fichier(s) ajouté(s) à la réponse.`);
                  },
                  onError: (error) =>
                    setAnswerAttachmentNotice(error instanceof Error ? error.message : "Impossible d'envoyer ces fichiers."),
                });
              }}
            />
            {answerAttachments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {answerAttachments.map((url) => (
                  <li key={url} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px]">
                    <a href={url} target="_blank" rel="noreferrer" className="truncate text-[var(--brand-primary)]">{url}</a>
                    <button
                      type="button"
                      onClick={() => setAnswerAttachments((current) => current.filter((item) => item !== url))}
                      className="shrink-0 text-[var(--color-text-muted)] hover:text-red-600"
                      aria-label="Retirer ce fichier"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {answerAttachmentNotice && <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{answerAttachmentNotice}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => answerAttachmentInputRef.current?.click()}
                disabled={uploadAnswerAttachments.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:opacity-50"
              >
                {uploadAnswerAttachments.isPending ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />} Joindre un fichier
              </button>
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

        <aside className="h-fit space-y-4">
          <AdSlot position="forum_sidebar" />
          <div className="space-y-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <button
            type="button"
            disabled={isFavoriteTogglePending(id)}
            onClick={() => toggleFavoriteMutation.mutate({ targetId: id })}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-semibold disabled:opacity-50 ${
              isFavorited ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)]"
            }`}
          >
            <Bookmark size={15} className={isFavorited ? "fill-current" : undefined} />
            {isFavorited ? "Dans mes favoris" : "Ajouter aux favoris"}
          </button>
          <button
            type="button"
            disabled={reportMutation.isPending || reported}
            onClick={() => reportMutation.mutate({ targetId: id, targetType: "QUESTION" }, { onSuccess: () => setReported(true) })}
            className="h-11 w-full rounded-full border border-[var(--brand-border)] text-[13px] font-semibold disabled:opacity-50"
          >
            {reported ? "Signalée" : "Signaler"}
          </button>
          {reported && <p className="rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">Signalement enregistré.</p>}
          <div className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[12px] text-[var(--color-text-muted)]">
            Les actions de modération avancées seront disponibles selon vos droits.
          </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
