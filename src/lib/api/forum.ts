import { apiRequest } from "./client";

export type ForumQuestionQuery = {
  page?: number;
  limit?: number;
  category?: string;
  categoryId?: string;
  tag?: string;
  status?: "open" | "closed";
  customFields?: Record<string, string>;
};

export type QuestionPayload = {
  title: string;
  content: string;
  category?: string;
  categoryId?: string;
  customFields?: Record<string, string>;
  tags?: string[];
  attachments?: string[];
};

export type AnswerPayload = {
  content: string;
  attachments?: string[];
};

export type CommentPayload = {
  targetId: string;
  targetType: "QUESTION" | "ANSWER";
  content: string;
};

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  children?: ForumCategory[];
};

export type VotePayload = {
  targetId: string;
  targetType: "QUESTION" | "ANSWER" | "COMMENT";
  value: -1 | 0 | 1;
};

export type ReportPayload = {
  targetId: string;
  targetType: "QUESTION" | "ANSWER" | "COMMENT" | "PROFILE" | "PRODUCT";
  reason?: string;
  details?: string;
};

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

const toForumQuery = (params: ForumQuestionQuery) => {
  const { customFields, ...rest } = params;
  const query = new URLSearchParams(toQuery(rest));
  Object.entries(customFields ?? {}).forEach(([key, value]) => {
    if (value) query.set(`cf_${key}`, value);
  });
  return query.toString();
};

export async function listQuestions(params: ForumQuestionQuery = {}) {
  const query = toForumQuery(params);
  const response = await apiRequest<unknown[]>(`/forum/questions${query ? `?${query}` : ""}`);
  return { questions: response.data ?? [], pagination: response.pagination };
}

export async function listForumCategories() {
  const response = await apiRequest<ForumCategory[]>("/forum/categories");
  return response.data ?? [];
}

export async function listMyQuestions(params: ForumQuestionQuery = {}) {
  const query = toForumQuery(params);
  const response = await apiRequest<unknown[]>(`/forum/questions/mine${query ? `?${query}` : ""}`);
  return { questions: response.data ?? [], pagination: response.pagination };
}

export async function getQuestion(id: string) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}`);
  return response.data;
}

export async function createQuestion(payload: QuestionPayload) {
  const response = await apiRequest<unknown>("/forum/questions", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateQuestion(id: string, payload: Partial<QuestionPayload>) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function createAnswer(questionId: string, payload: AnswerPayload) {
  const response = await apiRequest<unknown>(`/forum/questions/${questionId}/answers`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateAnswer(id: string, payload: Pick<AnswerPayload, "content">) {
  const response = await apiRequest<unknown>(`/forum/answers/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function acceptAnswer(id: string) {
  const response = await apiRequest<null>(`/forum/answers/${id}/accept`, {
    method: "POST",
  });
  return response.data;
}

export async function createComment(payload: CommentPayload) {
  const response = await apiRequest<unknown>("/forum/comments", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateComment(id: string, content: string) {
  const response = await apiRequest<unknown>(`/forum/comments/${id}`, {
    method: "PUT",
    body: { content },
  });
  return response.data;
}

export async function toggleFavorite(targetId: string, targetType: "QUESTION" | "ANSWER" = "QUESTION") {
  const response = await apiRequest<{ favorited: boolean }>("/forum/favorites", {
    method: "POST",
    body: { targetId, targetType },
  });
  return response.data;
}

export async function listMyFavorites(targetType: "QUESTION" | "ANSWER" = "QUESTION") {
  const response = await apiRequest<unknown[]>(`/forum/favorites/mine?targetType=${targetType}`);
  return response.data ?? [];
}

export async function vote(payload: VotePayload) {
  const response = await apiRequest<unknown>("/forum/vote", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function report(payload: ReportPayload) {
  const response = await apiRequest<unknown>("/forum/report", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function featureQuestion(id: string, isFeatured = true) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}/feature`, {
    method: "POST",
    body: { isFeatured },
  });
  return response.data;
}

export async function closeQuestion(id: string, isClosed = true) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}/close`, {
    method: "POST",
    body: { isClosed },
  });
  return response.data;
}

export async function searchQuestions(q: string) {
  const response = await apiRequest<unknown[]>(`/forum/search?q=${encodeURIComponent(q)}`);
  return response.data ?? [];
}

export async function uploadForumAttachments(files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await apiRequest<{ urls: string[] }>("/forum/attachments", {
    method: "POST",
    body,
  });
  return response.data?.urls ?? [];
}
