import type { Question, ForumAnswer, ForumAttachment, ForumComment } from "@/types";

export type BackendUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  reputationScore?: number | null;
  avatarUrl?: string | null;
};

export type BackendForumComment = {
  id?: string;
  content?: string;
  voteCount?: number;
  createdAt?: string;
  author?: BackendUser | null;
};

export type BackendAnswer = {
  id?: string;
  content?: string;
  voteCount?: number;
  isAccepted?: boolean;
  attachments?: string[];
  createdAt?: string;
  author?: BackendUser | null;
};

export type BackendQuestion = {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  voteCount?: number;
  viewCount?: number;
  isClosed?: boolean;
  isFeatured?: boolean;
  acceptedAnswerId?: string | null;
  attachments?: string[];
  createdAt?: string;
  author?: BackendUser | null;
  answers?: BackendAnswer[];
  comments?: BackendForumComment[];
  _count?: { answers?: number };
};

const authorName = (author?: BackendUser | null) =>
  [author?.firstName, author?.lastName].filter(Boolean).join(" ").trim() || "Membre Iwosan";

const imageExtensions = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

const toAttachments = (urls?: string[]): ForumAttachment[] =>
  (urls ?? []).map((url) => ({
    id: url,
    type: imageExtensions.test(url) ? "image" : "file",
    name: decodeURIComponent(url.split("/").pop() ?? url),
    url,
  }));

const toForumComment = (comment: BackendForumComment): ForumComment => ({
  id: comment.id ?? "",
  authorId: comment.author?.id,
  authorName: authorName(comment.author),
  content: comment.content ?? "",
  date: comment.createdAt ?? new Date().toISOString(),
  votes: comment.voteCount ?? 0,
});

const toForumAnswer = (answer: BackendAnswer): ForumAnswer => ({
  id: answer.id ?? "",
  body: answer.content ?? "",
  authorName: authorName(answer.author),
  authorAvatar: answer.author?.avatarUrl ?? undefined,
  authorReputation: answer.author?.reputationScore ?? 0,
  date: answer.createdAt ?? new Date().toISOString(),
  votes: answer.voteCount ?? 0,
  accepted: Boolean(answer.isAccepted),
  attachments: toAttachments(answer.attachments),
  comments: [],
});

export function toQuestion(question: BackendQuestion): Question | null {
  if (!question.id || !question.title) return null;
  const content = question.content ?? "";
  return {
    id: question.id,
    authorId: question.author?.id,
    title: question.title,
    excerpt: content.slice(0, 220),
    body: content,
    category: question.category ?? "General",
    tags: question.tags ?? [],
    votes: question.voteCount ?? 0,
    answers: question._count?.answers ?? question.answers?.length ?? 0,
    views: question.viewCount ?? 0,
    resolved: Boolean(question.acceptedAnswerId),
    featured: question.isFeatured,
    closed: question.isClosed,
    attachments: toAttachments(question.attachments),
    answerItems: question.answers ? question.answers.map(toForumAnswer) : undefined,
    authorName: authorName(question.author),
    authorAvatar: question.author?.avatarUrl ?? undefined,
    authorReputation: question.author?.reputationScore ?? 0,
    date: question.createdAt ?? new Date().toISOString(),
  };
}

export function toComments(comments: BackendForumComment[] | undefined): ForumComment[] {
  return (comments ?? []).map(toForumComment);
}
