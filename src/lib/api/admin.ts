import { apiRequest } from "./client";

export const getAdminDashboard = () => apiRequest<unknown>("/admin/dashboard");
export const getAdminUsers = () => apiRequest<unknown[]>("/admin/users");
export const getAdminUser = (id: string) => apiRequest<unknown>(`/admin/users/${id}`);
export const banAdminUser = (id: string, reason: string) =>
  apiRequest<unknown>(`/admin/users/${id}/ban`, { method: "PUT", body: { reason } });
export const updateAdminUserRole = (id: string, role: string) =>
  apiRequest<unknown>(`/admin/users/${id}/role`, { method: "PUT", body: { role } });

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

export const getAdminBanners = () => apiRequest<unknown[]>("/admin/banners");
export const getAdminAds = () => apiRequest<unknown[]>("/admin/ads");
export const getAdminConfig = () => apiRequest<unknown[]>("/admin/config");
export const updateAdminConfig = (body: unknown) =>
  apiRequest<unknown>("/admin/config", { method: "PUT", body });
export const updateMaintenanceMode = (enabled: boolean) =>
  apiRequest<unknown>("/admin/maintenance", { method: "POST", body: { enabled } });

export const getAdminTickets = () => apiRequest<unknown[]>("/admin/tickets");
export const updateAdminTicketStatus = (id: string, status: string) =>
  apiRequest<unknown>(`/admin/tickets/${id}/status`, { method: "PUT", body: { status } });
export const replyAdminTicket = (id: string, content: string) =>
  apiRequest<unknown>(`/admin/tickets/${id}/reply`, { method: "POST", body: { content } });

export const sendAdminNewsletter = (body: unknown) =>
  apiRequest<unknown>("/admin/newsletter/send", { method: "POST", body });
export const getAdminNewsletterSubscribers = () =>
  apiRequest<unknown[]>("/admin/newsletter/subscribers");
