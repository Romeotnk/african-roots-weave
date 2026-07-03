import { apiRequest } from "./client";

export type ArticleSpace =
  | "SANTE_NATURELLE"
  | "PHARMACOPEE"
  | "RITES_CULTURES"
  | "RECHERCHE"
  | "ACTUALITES";

export type ArticleQuery = {
  page?: number;
  limit?: number;
  space?: ArticleSpace;
  category?: string;
  author?: string;
  tag?: string;
};

export type ArticlePayload = {
  space: ArticleSpace;
  title: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
};

export type MonographPayload = Record<string, unknown>;

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export async function listArticles(params: ArticleQuery = {}) {
  const query = toQuery(params);
  const response = await apiRequest<unknown[]>(`/articles${query ? `?${query}` : ""}`);
  return { articles: response.data ?? [], pagination: response.pagination };
}

export async function getArticle(slug: string) {
  const response = await apiRequest<unknown>(`/articles/${slug}`);
  return response.data;
}

export async function createArticle(payload: ArticlePayload) {
  const response = await apiRequest<unknown>("/articles", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateArticle(id: string, payload: Partial<ArticlePayload> & { isApproved?: boolean }) {
  const response = await apiRequest<unknown>(`/articles/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteArticle(id: string) {
  const response = await apiRequest<null>(`/articles/${id}`, { method: "DELETE" });
  return response.data;
}

export async function publishArticle(id: string) {
  const response = await apiRequest<unknown>(`/articles/${id}/publish`, {
    method: "POST",
  });
  return response.data;
}

export async function listMonographs() {
  const response = await apiRequest<unknown[]>("/monographs");
  return response.data ?? [];
}

export async function getMonograph(id: string) {
  const response = await apiRequest<unknown>(`/monographs/${id}`);
  return response.data;
}

export async function createMonograph(payload: MonographPayload) {
  const response = await apiRequest<unknown>("/monographs", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateMonograph(id: string, payload: MonographPayload) {
  const response = await apiRequest<unknown>(`/monographs/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}
