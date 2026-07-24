import { apiRequest } from "./client";

export const getAdminDashboard = () => apiRequest<AdminDashboardStats>("/admin/dashboard");

export type AdminDashboardStats = {
  totalUsers: number;
  revenue: string | number | null;
  activeListings: number;
  pendingKYC: number;
  openTickets: number;
  newUsersToday: number;
  topCategories: { category: string; _count: { id: number } }[];
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  adminSubRole: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  country: string;
  kycStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  walletBalance: string | number;
  reputationScore: number;
  isActive: boolean;
  isBanned: boolean;
  banReason: string | null;
  banExpiresAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AdminUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  banned?: boolean;
  kyc?: string;
};

const toQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const getAdminUsers = (params: AdminUsersQuery = {}) => {
  const query = toQuery(params);
  return apiRequest<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`);
};
export const getAdminUser = (id: string) => apiRequest<AdminUser>(`/admin/users/${id}`);
export const banAdminUser = (id: string, reason: string, duration?: number) =>
  apiRequest<unknown>(`/admin/users/${id}/ban`, { method: "PUT", body: { reason, duration } });
export const unbanAdminUser = (id: string) =>
  apiRequest<unknown>(`/admin/users/${id}/unban`, { method: "POST" });
export const updateAdminUserRole = (id: string, role: string, subRole?: string) =>
  apiRequest<unknown>(`/admin/users/${id}/role`, { method: "PUT", body: { role, subRole } });
export const getAdminKycDocuments = (id: string) => apiRequest<unknown>(`/admin/users/${id}/kyc-documents`);
export const approveAdminKyc = (id: string) =>
  apiRequest<unknown>(`/admin/users/${id}/kyc-approve`, { method: "PUT" });
export const rejectAdminKyc = (id: string) =>
  apiRequest<unknown>(`/admin/users/${id}/kyc-reject`, { method: "PUT" });
export const getAdminAuditLog = () => apiRequest<unknown[]>("/admin/audit-log");

export const getPendingProducts = () => apiRequest<unknown[]>("/admin/products/pending");
export const approveProduct = (id: string) =>
  apiRequest<unknown>(`/admin/products/${id}/approve`, { method: "PUT" });
export const rejectProduct = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/products/${id}/reject`, { method: "PUT", body: { reason } });

export const getPendingArticles = () => apiRequest<unknown[]>("/admin/articles/pending");
export const approveArticle = (id: string) =>
  apiRequest<unknown>(`/admin/articles/${id}/approve`, { method: "PUT" });
export const rejectArticle = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/articles/${id}/reject`, { method: "PUT", body: { reason } });

export const getPendingProfessionals = () => apiRequest<unknown[]>("/admin/professionals/pending");
export const verifyProfessional = (id: string) =>
  apiRequest<unknown>(`/admin/professionals/${id}/verify`, { method: "PUT" });

export const getAdminBanners = () => apiRequest<unknown[]>("/admin/banners");
export const createAdminBanner = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/banners", { method: "POST", body });
export const updateAdminBanner = (id: string, body: Record<string, unknown>) =>
  apiRequest<unknown>(`/admin/banners/${id}`, { method: "PUT", body });
export const deleteAdminBanner = (id: string) =>
  apiRequest<null>(`/admin/banners/${id}`, { method: "DELETE" });

export const getAdminAds = () => apiRequest<unknown[]>("/admin/ads");
export const createAdminAd = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/ads", { method: "POST", body });
export const updateAdminAd = (id: string, body: Record<string, unknown>) =>
  apiRequest<unknown>(`/admin/ads/${id}`, { method: "PUT", body });
export const deleteAdminAd = (id: string) =>
  apiRequest<null>(`/admin/ads/${id}`, { method: "DELETE" });

export const getAdminConfig = () => apiRequest<{ key: string; value: string }[]>("/admin/config");
export const updateAdminConfig = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/config", { method: "PUT", body });
export const updateMaintenanceMode = (enabled: boolean) =>
  apiRequest<unknown>("/admin/maintenance", { method: "POST", body: { enabled } });

export const getAdminCommissionConfig = () =>
  apiRequest<{ key: string; value: string }[]>("/admin/commissions/config");
export const updateAdminCommissionConfig = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/commissions/config", { method: "PUT", body });

export const getAdminTickets = () => apiRequest<unknown[]>("/admin/tickets");
export const updateAdminTicketStatus = (id: string, status: string) =>
  apiRequest<unknown>(`/admin/tickets/${id}/status`, { method: "PUT", body: { status } });
export const replyAdminTicket = (id: string, content: string) =>
  apiRequest<unknown>(`/admin/tickets/${id}/reply`, { method: "POST", body: { content } });

export const sendAdminNewsletter = (body: unknown) =>
  apiRequest<unknown>("/admin/newsletter/send", { method: "POST", body });
export const getAdminNewsletterSubscribers = () =>
  apiRequest<unknown[]>("/admin/newsletter/subscribers");

export const broadcastAdminNotification = (body: { audience: string; title: string; message: string; link?: string }) =>
  apiRequest<{ recipientCount: number }>("/admin/notifications/broadcast", { method: "POST", body });

// Community moderation: reports, forum, reviews.
export type AdminReport = {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";
  createdAt: string;
  reporter: { id: string; firstName: string; lastName: string; email: string };
};

export const getAdminReports = (params: { status?: string; targetType?: string; page?: number } = {}) =>
  apiRequest<AdminReport[]>(`/admin/reports${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const resolveAdminReport = (id: string, action: "DISMISS" | "ACTION", reason?: string) =>
  apiRequest<AdminReport>(`/admin/reports/${id}/resolve`, { method: "PUT", body: { action, reason } });

export const getAdminForumQuestions = (params: { hidden?: boolean; page?: number } = {}) =>
  apiRequest<unknown[]>(`/admin/forum/questions${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const hideAdminQuestion = (id: string, hidden: boolean) =>
  apiRequest<unknown>(`/admin/forum/questions/${id}/hide`, { method: "PUT", body: { hidden } });
export const hideAdminAnswer = (id: string, hidden: boolean) =>
  apiRequest<unknown>(`/admin/forum/answers/${id}/hide`, { method: "PUT", body: { hidden } });
export const getAdminForumComments = (params: { hidden?: boolean; page?: number } = {}) =>
  apiRequest<unknown[]>(`/admin/forum/comments${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const hideAdminComment = (id: string, hidden: boolean) =>
  apiRequest<unknown>(`/admin/forum/comments/${id}/hide`, { method: "PUT", body: { hidden } });

export type AdminReview = {
  id: string;
  authorId: string;
  targetId: string;
  targetType: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

export const getAdminReviews = (params: { hidden?: boolean; targetType?: string; page?: number } = {}) =>
  apiRequest<AdminReview[]>(`/admin/reviews${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const hideAdminReview = (id: string, hidden: boolean, reason?: string) =>
  apiRequest<AdminReview>(`/admin/reviews/${id}/hide`, { method: "PUT", body: { hidden, reason } });

// Finances: refunds, disputes, transactions.
export type AdminOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  totalAmount: string | number;
  commissionAmount: string | number;
  status: string;
  escrowStatus: string;
  disputeReason: string | null;
  refundStatus: string | null;
  createdAt: string;
  updatedAt: string;
  product: { id: string; title: string; slug: string };
  buyer: { id: string; firstName: string; lastName: string; email: string };
  seller: { id: string; firstName: string; lastName: string; email: string };
};

export const getAdminRefundRequests = (params: { status?: string; page?: number } = {}) =>
  apiRequest<AdminOrder[]>(`/admin/refunds${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const approveAdminRefund = (id: string, reason?: string) =>
  apiRequest<AdminOrder>(`/admin/refunds/${id}/approve`, { method: "PUT", body: { reason } });
export const rejectAdminRefund = (id: string, reason: string) =>
  apiRequest<AdminOrder>(`/admin/refunds/${id}/reject`, { method: "PUT", body: { reason } });

export const getAdminDisputes = (params: { page?: number } = {}) =>
  apiRequest<AdminOrder[]>(`/admin/disputes${toQuery(params) ? `?${toQuery(params)}` : ""}`);
export const resolveAdminDispute = (id: string, resolution: "REFUND_BUYER" | "RELEASE_SELLER", reason?: string) =>
  apiRequest<AdminOrder>(`/admin/disputes/${id}/resolve`, { method: "PUT", body: { resolution, reason } });

export type AdminWalletTransaction = {
  id: string;
  userId: string;
  amount: string | number;
  type: string;
  reference: string;
  description: string | null;
  balanceBefore: string | number;
  balanceAfter: string | number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
};

export const getAdminTransactions = (params: { userId?: string; type?: string; page?: number } = {}) =>
  apiRequest<AdminWalletTransaction[]>(`/admin/transactions${toQuery(params) ? `?${toQuery(params)}` : ""}`);

// Affiliation / MLM overview.
export type AdminMlmOverview = {
  totalsByType: { type: string; _sum: { amount: string | number | null }; _count: { id: number } }[];
  totalNodes: number;
  topEarners: {
    id: string;
    affiliateCode: string;
    level: number;
    totalDownlineCount: number;
    totalEarnings: string | number;
    user: { id: string; firstName: string; lastName: string; email: string };
  }[];
};

export const getAdminMlmOverview = () => apiRequest<AdminMlmOverview>("/admin/mlm/overview");
