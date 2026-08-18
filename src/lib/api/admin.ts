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
  professionalProfile: {
    id: string;
    defaultCommissionRate: number | null;
    isPortraitOfWeek: boolean;
    portraitStartDate: string | null;
    portraitEndDate: string | null;
    isVerified: boolean;
    verificationDocs: string[] | null;
  } | null;
  permissionOverrides: { grant?: string[]; revoke?: string[] } | null;
  customRoleId: string | null;
  customRole: { id: string; name: string } | null;
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

export type PermissionCatalogEntry = { key: string; label: string; group: string };
export type RolePermissionsMap = Partial<Record<string, string[]>>;

export const getAdminPermissions = () =>
  apiRequest<{ catalog: PermissionCatalogEntry[]; rolePermissions: RolePermissionsMap }>("/admin/permissions");
export const updateAdminRolePermissions = (role: string, permissions: string[]) =>
  apiRequest<unknown>(`/admin/permissions/role/${role}`, { method: "PUT", body: { permissions } });
export const updateAdminUserPermissionOverrides = (id: string, body: { grant: string[]; revoke: string[] }) =>
  apiRequest<AdminUser>(`/admin/users/${id}/permissions`, { method: "PATCH", body });

export type CustomRole = { id: string; name: string; permissions: string[]; createdAt: string; updatedAt: string };

export const getAdminCustomRoles = () => apiRequest<CustomRole[]>("/admin/custom-roles");
export const createAdminCustomRole = (name: string, permissions: string[]) =>
  apiRequest<CustomRole>("/admin/custom-roles", { method: "POST", body: { name, permissions } });
export const updateAdminCustomRole = (id: string, body: { name?: string; permissions?: string[] }) =>
  apiRequest<CustomRole>(`/admin/custom-roles/${id}`, { method: "PUT", body });
export const deleteAdminCustomRole = (id: string) =>
  apiRequest<null>(`/admin/custom-roles/${id}`, { method: "DELETE" });
export const applyAdminCustomRoleToUser = (userId: string, customRoleId: string) =>
  apiRequest<AdminUser>(`/admin/users/${userId}/custom-role`, { method: "POST", body: { customRoleId } });
export const unassignAdminCustomRoleFromUser = (userId: string) =>
  apiRequest<AdminUser>(`/admin/users/${userId}/custom-role`, { method: "DELETE" });

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

export const getPendingEvents = () => apiRequest<unknown[]>("/admin/events/pending");
export const approveEvent = (id: string) =>
  apiRequest<unknown>(`/admin/events/${id}/approve`, { method: "PUT" });
export const rejectEvent = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/events/${id}/reject`, { method: "PUT", body: { reason } });

export const getPendingFormations = () => apiRequest<unknown[]>("/admin/formations/pending");
export const approveFormation = (id: string) =>
  apiRequest<unknown>(`/admin/formations/${id}/approve`, { method: "PUT" });
export const rejectFormation = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/formations/${id}/reject`, { method: "PUT", body: { reason } });

export const getPendingProfessionals = () => apiRequest<unknown[]>("/admin/professionals/pending");
export const verifyProfessional = (id: string) =>
  apiRequest<unknown>(`/admin/professionals/${id}/verify`, { method: "PUT" });
export const rejectProfessional = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/professionals/${id}/reject`, { method: "PUT", body: { reason } });
export const updateProfessionalCommissionRate = (id: string, defaultCommissionRate: number | null) =>
  apiRequest<unknown>(`/admin/professionals/${id}/commission-rate`, { method: "PUT", body: { defaultCommissionRate } });
export const setProfessionalPortraitOfWeek = (id: string, startDate: string, endDate: string) =>
  apiRequest<unknown>(`/admin/professionals/${id}/portrait-of-week`, { method: "PUT", body: { startDate, endDate } });

export const getAdminBanners = () => apiRequest<unknown[]>("/admin/banners");
export const createAdminBanner = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/banners", { method: "POST", body });
export const updateAdminBanner = (id: string, body: Record<string, unknown>) =>
  apiRequest<unknown>(`/admin/banners/${id}`, { method: "PUT", body });
export const deleteAdminBanner = (id: string) =>
  apiRequest<null>(`/admin/banners/${id}`, { method: "DELETE" });

export const getAdminPartnerLogos = () => apiRequest<unknown[]>("/admin/partner-logos");
export const createAdminPartnerLogo = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/partner-logos", { method: "POST", body });
export const updateAdminPartnerLogo = (id: string, body: Record<string, unknown>) =>
  apiRequest<unknown>(`/admin/partner-logos/${id}`, { method: "PUT", body });
export const deleteAdminPartnerLogo = (id: string) =>
  apiRequest<null>(`/admin/partner-logos/${id}`, { method: "DELETE" });

export const getAdminAds = () => apiRequest<unknown[]>("/admin/ads");
export const createAdminAd = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/ads", { method: "POST", body });
export const updateAdminAd = (id: string, body: Record<string, unknown>) =>
  apiRequest<unknown>(`/admin/ads/${id}`, { method: "PUT", body });
export const deleteAdminAd = (id: string) =>
  apiRequest<null>(`/admin/ads/${id}`, { method: "DELETE" });

export type AdminPage = {
  id: string;
  slug: string;
  title: string;
  contentHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  updatedAt: string;
};

export const getAdminPages = () => apiRequest<AdminPage[]>("/admin/pages");
export const createAdminPage = (body: Partial<Omit<AdminPage, "id" | "updatedAt">>) =>
  apiRequest<AdminPage>("/admin/pages", { method: "POST", body });
export const updateAdminPage = (id: string, body: Partial<Omit<AdminPage, "id" | "updatedAt">>) =>
  apiRequest<AdminPage>(`/admin/pages/${id}`, { method: "PUT", body });
export const deleteAdminPage = (id: string) => apiRequest<null>(`/admin/pages/${id}`, { method: "DELETE" });

export const getAdminConfig = () => apiRequest<{ key: string; value: string }[]>("/admin/config");
export const updateAdminConfig = (body: Record<string, unknown>) =>
  apiRequest<unknown>("/admin/config", { method: "PUT", body });
export const updateMaintenanceMode = (enabled: boolean) =>
  apiRequest<unknown>("/admin/maintenance", { method: "POST", body: { enabled } });

export type AdminTranslation = { id: string; locale: string; key: string; value: string; updatedAt: string };
export const getAdminTranslations = (locale: string) =>
  apiRequest<AdminTranslation[]>(`/admin/translations?locale=${encodeURIComponent(locale)}`);
export const updateAdminTranslations = (locale: string, entries: Record<string, string>) =>
  apiRequest<AdminTranslation[]>("/admin/translations", { method: "PUT", body: { locale, entries } });

export type AdminEmailTemplate = { id: string | null; key: string; subject: string; html: string; updatedAt: string | null };
export const getAdminEmailTemplates = () => apiRequest<AdminEmailTemplate[]>("/admin/email-templates");
export const updateAdminEmailTemplate = (key: string, subject: string, html: string) =>
  apiRequest<AdminEmailTemplate>(`/admin/email-templates/${key}`, { method: "PUT", body: { subject, html } });

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
  reasonCategory: "FRAUDULENT_CONTENT" | "PROHIBITED_ITEM" | "SCAM" | "INAPPROPRIATE_CONTENT" | "SPAM" | "OTHER" | null;
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

export type AdminForumCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  _count: { questions: number };
};

export const getAdminForumCategories = () => apiRequest<AdminForumCategory[]>("/admin/forum/categories");
export const createAdminForumCategory = (body: { name: string; parentId?: string; position?: number }) =>
  apiRequest<AdminForumCategory>("/admin/forum/categories", { method: "POST", body });
export const updateAdminForumCategory = (id: string, body: { name?: string; position?: number }) =>
  apiRequest<AdminForumCategory>(`/admin/forum/categories/${id}`, { method: "PUT", body });
export const deleteAdminForumCategory = (id: string) =>
  apiRequest<null>(`/admin/forum/categories/${id}`, { method: "DELETE" });

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
  sellerRefundNote: string | null;
  sellerAcknowledgedAt: string | null;
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

export type AdminSubscription = {
  id: string;
  userId: string;
  plan: "FREE" | "BASIC" | "PRO" | "EXPERT";
  price: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  maxListings: number;
  maxDownloads: number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
};

export const getAdminSubscriptions = (params: { page?: number } = {}) =>
  apiRequest<AdminSubscription[]>(`/admin/subscriptions${toQuery(params) ? `?${toQuery(params)}` : ""}`);

export const updateAdminSubscription = (
  id: string,
  payload: Partial<Pick<AdminSubscription, "plan" | "price" | "endDate" | "isActive" | "autoRenew" | "maxListings" | "maxDownloads">>,
) => apiRequest<AdminSubscription>(`/admin/subscriptions/${id}`, { method: "PUT", body: payload });

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
