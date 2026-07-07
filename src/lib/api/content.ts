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

const asList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.articles)) return record.articles;
    if (Array.isArray(record.monographs)) return record.monographs;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

export async function listArticles(params: ArticleQuery = {}) {
  const query = toQuery(params);
  try {
    const response = await apiRequest<unknown>(`/articles${query ? `?${query}` : ""}`);
    return { articles: asList(response.data), pagination: response.pagination };
  } catch {
    return { articles: [], pagination: undefined };
  }
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
  try {
    const response = await apiRequest<unknown>("/monographs");
    return asList(response.data);
  } catch {
    return [];
  }
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
