import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  createMonograph,
  deleteArticle,
  getArticle,
  getMonograph,
  listArticles,
  listMonographs,
  publishArticle,
  updateArticle,
  updateMonograph,
  type ArticlePayload,
  type ArticleQuery,
  type MonographPayload,
} from "@/lib/api/content";

const isBrowser = typeof window !== "undefined";

export const contentKeys = {
  articles: (params: ArticleQuery = {}) => ["content", "articles", params] as const,
  article: (slug: string) => ["content", "article", slug] as const,
  monographs: ["content", "monographs"] as const,
  monograph: (id: string) => ["content", "monograph", id] as const,
};

export function useArticles(params: ArticleQuery = {}) {
  return useQuery({
    queryKey: contentKeys.articles(params),
    queryFn: () => listArticles(params),
    enabled: isBrowser,
    retry: false,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: contentKeys.article(slug),
    queryFn: () => getArticle(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "articles"] }),
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArticlePayload> & { isApproved?: boolean } }) =>
      updateArticle(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "articles"] }),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "articles"] }),
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "articles"] }),
  });
}

export function useMonographs() {
  return useQuery({
    queryKey: contentKeys.monographs,
    queryFn: listMonographs,
    enabled: isBrowser,
    retry: false,
  });
}

export function useMonograph(id: string, enabled = true) {
  return useQuery({
    queryKey: contentKeys.monograph(id),
    queryFn: () => getMonograph(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useCreateMonograph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMonograph,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKeys.monographs }),
  });
}

export function useUpdateMonograph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MonographPayload }) => updateMonograph(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKeys.monographs }),
  });
}