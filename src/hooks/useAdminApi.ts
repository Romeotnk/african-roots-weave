import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveArticle,
  approveProduct,
  getAdminDashboard,
  getAdminTickets,
  getAdminUsers,
  getPendingArticles,
  getPendingProducts,
  rejectArticle,
  rejectProduct,
  sendAdminNewsletter,
} from "@/lib/api/admin";
import { isAdminToken } from "@/lib/authToken";

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  users: ["admin", "users"] as const,
  productsPending: ["admin", "products", "pending"] as const,
  articlesPending: ["admin", "articles", "pending"] as const,
  tickets: ["admin", "tickets"] as const,
};

const adminEnabled = () => typeof window !== "undefined" && isAdminToken();

export function useAdminDashboard() {
  return useQuery({ queryKey: adminKeys.dashboard, queryFn: getAdminDashboard, enabled: adminEnabled(), retry: false });
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: getAdminUsers, enabled: adminEnabled(), retry: false });
}

export function usePendingProducts() {
  return useQuery({ queryKey: adminKeys.productsPending, queryFn: getPendingProducts, enabled: adminEnabled(), retry: false });
}

export function usePendingArticles() {
  return useQuery({ queryKey: adminKeys.articlesPending, queryFn: getPendingArticles, enabled: adminEnabled(), retry: false });
}

export function useAdminTickets() {
  return useQuery({ queryKey: adminKeys.tickets, queryFn: getAdminTickets, enabled: adminEnabled(), retry: false });
}

export function useAdminModerationActions() {
  const queryClient = useQueryClient();
  const refreshModeration = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.productsPending });
    queryClient.invalidateQueries({ queryKey: adminKeys.articlesPending });
  };
  return {
    approveProduct: useMutation({ mutationFn: approveProduct, onSuccess: refreshModeration }),
    rejectProduct: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectProduct(id, reason),
      onSuccess: refreshModeration,
    }),
    approveArticle: useMutation({ mutationFn: approveArticle, onSuccess: refreshModeration }),
    rejectArticle: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectArticle(id, reason),
      onSuccess: refreshModeration,
    }),
  };
}

export function useSendAdminNewsletter() {
  return useMutation({ mutationFn: sendAdminNewsletter });
}
