import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveArticle,
  approveEvent,
  approveFormation,
  approveProduct,
  approveAdminKyc,
  approveAdminRefund,
  banAdminUser,
  broadcastAdminNotification,
  createAdminAd,
  createAdminBanner,
  deleteAdminAd,
  deleteAdminBanner,
  getAdminAds,
  getAdminAuditLog,
  getAdminBanners,
  getAdminCommissionConfig,
  getAdminConfig,
  getAdminDashboard,
  getAdminDisputes,
  getAdminForumComments,
  getAdminForumQuestions,
  getAdminKycDocuments,
  getAdminMlmOverview,
  getAdminNewsletterSubscribers,
  getAdminRefundRequests,
  getAdminReports,
  getAdminReviews,
  getAdminTickets,
  getAdminTransactions,
  getAdminUser,
  getAdminUsers,
  getPendingArticles,
  getPendingEvents,
  getPendingFormations,
  getPendingProducts,
  getPendingProfessionals,
  hideAdminAnswer,
  hideAdminComment,
  hideAdminQuestion,
  hideAdminReview,
  rejectAdminKyc,
  rejectAdminRefund,
  rejectArticle,
  rejectEvent,
  rejectFormation,
  rejectProduct,
  replyAdminTicket,
  resolveAdminDispute,
  resolveAdminReport,
  sendAdminNewsletter,
  unbanAdminUser,
  updateAdminAd,
  updateAdminBanner,
  updateAdminCommissionConfig,
  updateAdminConfig,
  updateAdminTicketStatus,
  updateAdminUserRole,
  updateMaintenanceMode,
  verifyProfessional,
  type AdminUsersQuery,
} from "@/lib/api/admin";
import { isAdminToken } from "@/lib/authToken";

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  users: (params: AdminUsersQuery = {}) => ["admin", "users", params] as const,
  user: (id: string) => ["admin", "users", "detail", id] as const,
  kycDocuments: (id: string) => ["admin", "users", "kyc-documents", id] as const,
  auditLog: ["admin", "audit-log"] as const,
  productsPending: ["admin", "products", "pending"] as const,
  articlesPending: ["admin", "articles", "pending"] as const,
  eventsPending: ["admin", "events", "pending"] as const,
  formationsPending: ["admin", "formations", "pending"] as const,
  professionalsPending: ["admin", "professionals", "pending"] as const,
  tickets: ["admin", "tickets"] as const,
  ads: ["admin", "ads"] as const,
  banners: ["admin", "banners"] as const,
  config: ["admin", "config"] as const,
  commissionConfig: ["admin", "commissions", "config"] as const,
  newsletterSubscribers: ["admin", "newsletter", "subscribers"] as const,
  reports: (params: Record<string, unknown> = {}) => ["admin", "reports", params] as const,
  forumQuestions: (params: Record<string, unknown> = {}) => ["admin", "forum", "questions", params] as const,
  forumComments: (params: Record<string, unknown> = {}) => ["admin", "forum", "comments", params] as const,
  reviews: (params: Record<string, unknown> = {}) => ["admin", "reviews", params] as const,
  refunds: (params: Record<string, unknown> = {}) => ["admin", "refunds", params] as const,
  disputes: (params: Record<string, unknown> = {}) => ["admin", "disputes", params] as const,
  transactions: (params: Record<string, unknown> = {}) => ["admin", "transactions", params] as const,
  mlmOverview: ["admin", "mlm", "overview"] as const,
};

const adminEnabled = () => typeof window !== "undefined" && isAdminToken();

export function useAdminDashboard() {
  return useQuery({ queryKey: adminKeys.dashboard, queryFn: getAdminDashboard, enabled: adminEnabled(), retry: false });
}

export function useAdminUsers(params: AdminUsersQuery = {}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => getAdminUsers(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getAdminUser(id),
    enabled: adminEnabled() && Boolean(id),
    retry: false,
  });
}

export function useAdminKycDocuments(id: string, enabled = false) {
  return useQuery({
    queryKey: adminKeys.kycDocuments(id),
    queryFn: () => getAdminKycDocuments(id),
    enabled: adminEnabled() && Boolean(id) && enabled,
    retry: false,
  });
}

export function useAdminAuditLog() {
  return useQuery({ queryKey: adminKeys.auditLog, queryFn: getAdminAuditLog, enabled: adminEnabled(), retry: false });
}

export function usePendingProducts() {
  return useQuery({ queryKey: adminKeys.productsPending, queryFn: getPendingProducts, enabled: adminEnabled(), retry: false });
}

export function usePendingArticles() {
  return useQuery({ queryKey: adminKeys.articlesPending, queryFn: getPendingArticles, enabled: adminEnabled(), retry: false });
}

export function usePendingEvents() {
  return useQuery({ queryKey: adminKeys.eventsPending, queryFn: getPendingEvents, enabled: adminEnabled(), retry: false });
}

export function usePendingFormations() {
  return useQuery({ queryKey: adminKeys.formationsPending, queryFn: getPendingFormations, enabled: adminEnabled(), retry: false });
}

export function usePendingProfessionals() {
  return useQuery({ queryKey: adminKeys.professionalsPending, queryFn: getPendingProfessionals, enabled: adminEnabled(), retry: false });
}

export function useAdminTickets() {
  return useQuery({ queryKey: adminKeys.tickets, queryFn: getAdminTickets, enabled: adminEnabled(), retry: false });
}

export function useAdminAds() {
  return useQuery({ queryKey: adminKeys.ads, queryFn: getAdminAds, enabled: adminEnabled(), retry: false });
}

export function useAdminBanners() {
  return useQuery({ queryKey: adminKeys.banners, queryFn: getAdminBanners, enabled: adminEnabled(), retry: false });
}

export function useAdminConfig() {
  return useQuery({ queryKey: adminKeys.config, queryFn: getAdminConfig, enabled: adminEnabled(), retry: false });
}

export function useAdminCommissionConfig() {
  return useQuery({ queryKey: adminKeys.commissionConfig, queryFn: getAdminCommissionConfig, enabled: adminEnabled(), retry: false });
}

export function useAdminNewsletterSubscribers() {
  return useQuery({ queryKey: adminKeys.newsletterSubscribers, queryFn: getAdminNewsletterSubscribers, enabled: adminEnabled(), retry: false });
}

export function useAdminUserActions() {
  const queryClient = useQueryClient();
  const refresh = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    if (id) queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
  };
  return {
    ban: useMutation({
      mutationFn: ({ id, reason, duration }: { id: string; reason: string; duration?: number }) => banAdminUser(id, reason, duration),
      onSuccess: (_data, variables) => refresh(variables.id),
    }),
    unban: useMutation({
      mutationFn: (id: string) => unbanAdminUser(id),
      onSuccess: (_data, id) => refresh(id),
    }),
    updateRole: useMutation({
      mutationFn: ({ id, role, subRole }: { id: string; role: string; subRole?: string }) => updateAdminUserRole(id, role, subRole),
      onSuccess: (_data, variables) => refresh(variables.id),
    }),
  };
}

export function useAdminKycActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  return {
    approve: useMutation({ mutationFn: approveAdminKyc, onSuccess: refresh }),
    reject: useMutation({ mutationFn: rejectAdminKyc, onSuccess: refresh }),
  };
}

export function useAdminModerationActions() {
  const queryClient = useQueryClient();
  const refreshModeration = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.productsPending });
    queryClient.invalidateQueries({ queryKey: adminKeys.articlesPending });
    queryClient.invalidateQueries({ queryKey: adminKeys.eventsPending });
    queryClient.invalidateQueries({ queryKey: adminKeys.formationsPending });
    queryClient.invalidateQueries({ queryKey: adminKeys.professionalsPending });
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
    approveEvent: useMutation({ mutationFn: approveEvent, onSuccess: refreshModeration }),
    rejectEvent: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectEvent(id, reason),
      onSuccess: refreshModeration,
    }),
    approveFormation: useMutation({ mutationFn: approveFormation, onSuccess: refreshModeration }),
    rejectFormation: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectFormation(id, reason),
      onSuccess: refreshModeration,
    }),
    verifyProfessional: useMutation({ mutationFn: verifyProfessional, onSuccess: refreshModeration }),
  };
}

export function useAdminTicketActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.tickets });
  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: string }) => updateAdminTicketStatus(id, status),
      onSuccess: refresh,
    }),
    reply: useMutation({
      mutationFn: ({ id, content }: { id: string; content: string }) => replyAdminTicket(id, content),
      onSuccess: refresh,
    }),
  };
}

export function useSendAdminNewsletter() {
  return useMutation({ mutationFn: sendAdminNewsletter });
}

export function useAdminAdsActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.ads });
  return {
    create: useMutation({ mutationFn: createAdminAd, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => updateAdminAd(id, body),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: deleteAdminAd, onSuccess: refresh }),
  };
}

export function useAdminBannersActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.banners });
  return {
    create: useMutation({ mutationFn: createAdminBanner, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => updateAdminBanner(id, body),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: deleteAdminBanner, onSuccess: refresh }),
  };
}

export function useUpdateAdminConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.config }),
  });
}

export function useUpdateMaintenanceMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMaintenanceMode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.config }),
  });
}

export function useUpdateAdminCommissionConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCommissionConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.commissionConfig }),
  });
}

export function useBroadcastAdminNotification() {
  return useMutation({ mutationFn: broadcastAdminNotification });
}

// Community moderation.
export function useAdminReports(params: { status?: string; targetType?: string } = {}) {
  return useQuery({
    queryKey: adminKeys.reports(params),
    queryFn: () => getAdminReports(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminReportActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  return {
    resolve: useMutation({
      mutationFn: ({ id, action, reason }: { id: string; action: "DISMISS" | "ACTION"; reason?: string }) =>
        resolveAdminReport(id, action, reason),
      onSuccess: refresh,
    }),
  };
}

export function useAdminForumQuestions(params: { hidden?: boolean } = {}) {
  return useQuery({
    queryKey: adminKeys.forumQuestions(params),
    queryFn: () => getAdminForumQuestions(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminForumComments(params: { hidden?: boolean } = {}) {
  return useQuery({
    queryKey: adminKeys.forumComments(params),
    queryFn: () => getAdminForumComments(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminForumActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "forum"] });
  };
  return {
    hideQuestion: useMutation({
      mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => hideAdminQuestion(id, hidden),
      onSuccess: refresh,
    }),
    hideAnswer: useMutation({
      mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => hideAdminAnswer(id, hidden),
      onSuccess: refresh,
    }),
    hideComment: useMutation({
      mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => hideAdminComment(id, hidden),
      onSuccess: refresh,
    }),
  };
}

export function useAdminReviews(params: { hidden?: boolean; targetType?: string } = {}) {
  return useQuery({
    queryKey: adminKeys.reviews(params),
    queryFn: () => getAdminReviews(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminReviewActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
  return {
    hide: useMutation({
      mutationFn: ({ id, hidden, reason }: { id: string; hidden: boolean; reason?: string }) =>
        hideAdminReview(id, hidden, reason),
      onSuccess: refresh,
    }),
  };
}

// Finances: refunds, disputes, transactions.
export function useAdminRefundRequests(params: { status?: string } = {}) {
  return useQuery({
    queryKey: adminKeys.refunds(params),
    queryFn: () => getAdminRefundRequests(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminRefundActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
  };
  return {
    approve: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason?: string }) => approveAdminRefund(id, reason),
      onSuccess: refresh,
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectAdminRefund(id, reason),
      onSuccess: refresh,
    }),
  };
}

export function useAdminDisputes() {
  return useQuery({
    queryKey: adminKeys.disputes(),
    queryFn: () => getAdminDisputes(),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminDisputeActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
  };
  return {
    resolve: useMutation({
      mutationFn: ({ id, resolution, reason }: { id: string; resolution: "REFUND_BUYER" | "RELEASE_SELLER"; reason?: string }) =>
        resolveAdminDispute(id, resolution, reason),
      onSuccess: refresh,
    }),
  };
}

export function useAdminTransactions(params: { userId?: string; type?: string } = {}) {
  return useQuery({
    queryKey: adminKeys.transactions(params),
    queryFn: () => getAdminTransactions(params),
    enabled: adminEnabled(),
    retry: false,
  });
}

export function useAdminMlmOverview() {
  return useQuery({
    queryKey: adminKeys.mlmOverview,
    queryFn: getAdminMlmOverview,
    enabled: adminEnabled(),
    retry: false,
  });
}
