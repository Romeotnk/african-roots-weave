import { apiRequest } from "./client";

export type ForumQuestionQuery = {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  status?: "open" | "closed";
};

export type QuestionPayload = {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  attachments?: string[];
};

export type AnswerPayload = {
  content: string;
  attachments?: string[];
};

export type CommentPayload = Record<string, unknown>;

export type VotePayload = {
  targetId: string;
  targetType: "QUESTION" | "ANSWER";
  value: -1 | 0 | 1;
};

export type ReportPayload = {
  targetId: string;
  targetType: "QUESTION" | "ANSWER" | "COMMENT";
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

export async function listQuestions(params: ForumQuestionQuery = {}) {
  const query = toQuery(params);
  const response = await apiRequest<unknown[]>(`/forum/questions${query ? `?${query}` : ""}`);
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

export async function featureQuestion(id: string) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}/feature`, {
    method: "POST",
  });
  return response.data;
}

export async function closeQuestion(id: string) {
  const response = await apiRequest<unknown>(`/forum/questions/${id}/close`, {
    method: "POST",
  });
  return response.data;
}

export async function searchQuestions(q: string) {
  const response = await apiRequest<unknown[]>(`/forum/search?q=${encodeURIComponent(q)}`);
  return response.data ?? [];
}
