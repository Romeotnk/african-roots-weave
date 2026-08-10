import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  createArticleComment,
  createMonograph,
  deleteArticle,
  deleteMonograph,
  getArticle,
  getMonograph,
  getMyArticles,
  listAllMonographsForAdmin,
  listArticleComments,
  listArticles,
  listArticlesForAdmin,
  listMonographs,
  publishArticle,
  updateArticle,
  updateMonograph,
  type ArticlePayload,
  type ArticleQuery,
  type ArticleSpace,
  type MonographPayload,
} from "@/lib/api/content";

const isBrowser = typeof window !== "undefined";

export const contentKeys = {
  articles: (params: ArticleQuery = {}) => ["content", "articles", params] as const,
  article: (slug: string) => ["content", "article", slug] as const,
  myArticles: ["content", "articles", "mine"] as const,
  monographs: ["content", "monographs"] as const,
  monograph: (id: string) => ["content", "monograph", id] as const,
  monographsAdmin: ["content", "monographs", "admin"] as const,
  articlesAdmin: (space?: ArticleSpace) => ["content", "articles", "admin", space ?? "all"] as const,
  articleComments: (articleId: string) => ["content", "article", articleId, "comments"] as const,
};

export function useArticleComments(articleId: string) {
  return useQuery({
    queryKey: contentKeys.articleComments(articleId),
    queryFn: () => listArticleComments(articleId),
    enabled: Boolean(articleId),
    retry: false,
  });
}

export function useCreateArticleComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, content }: { articleId: string; content: string }) => createArticleComment(articleId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.articleComments(variables.articleId) });
    },
  });
}

export function useMyArticles() {
  return useQuery({
    queryKey: contentKeys.myArticles,
    queryFn: getMyArticles,
    enabled: isBrowser,
    retry: false,
  });
}

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

export function useArticlesForAdmin(space?: ArticleSpace) {
  return useQuery({
    queryKey: contentKeys.articlesAdmin(space),
    queryFn: () => listArticlesForAdmin(space),
    enabled: isBrowser,
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

export function useAdminMonographs() {
  return useQuery({
    queryKey: contentKeys.monographsAdmin,
    queryFn: listAllMonographsForAdmin,
    enabled: isBrowser,
    retry: false,
  });
}

const invalidateMonographs = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: contentKeys.monographs });
  queryClient.invalidateQueries({ queryKey: contentKeys.monographsAdmin });
};

export function useCreateMonograph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMonograph,
    onSuccess: () => invalidateMonographs(queryClient),
  });
}

export function useUpdateMonograph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MonographPayload> }) => updateMonograph(id, payload),
    onSuccess: () => invalidateMonographs(queryClient),
  });
}

export function useDeleteMonograph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMonograph,
    onSuccess: () => invalidateMonographs(queryClient),
  });
}