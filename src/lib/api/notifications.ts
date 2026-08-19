import type { AppNotification, NotificationType } from "@/data/notifications";
import { apiRequest } from "./client";

export type BackendNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

const knownTypes: readonly NotificationType[] = [
  "ORDER_CREATED", "ORDER_PAID", "ORDER_SHIPPED", "ORDER_REFUNDED",
  "AUCTION_WON", "AUCTION_CLOSED", "BID_OUTBID",
  "SYSTEM", "SAVED_SEARCH_MATCH", "NEW_MESSAGE", "COMMISSION_EARNED",
  "QUOTE_REQUESTED", "QUOTE_PROPOSED", "QUOTE_DECLINED", "QUOTE_ACCEPTED",
  "FORMATION_ENROLLED", "FORMATION_SOLD",
  "KYC_SUBMITTED", "KYC_APPROVED", "KYC_REJECTED",
  "BOOKING_CONFIRMED", "BOOKING_CANCELLED", "REVIEW_RECEIVED",
  "ADMIN_BROADCAST", "TICKET_REPLY",
];

export const toNotification = (item: BackendNotification): AppNotification => {
  // The backend's Notification.type is a free-text String, not an enum — pass a
  // recognized value through as-is so NotificationBell can render its real icon;
  // fall back to the neutral "SYSTEM" bell icon (not the old "forum" default,
  // which misleadingly implied a forum-community icon) for any future type this
  // list hasn't caught up with yet.
  const upperType = item.type.toUpperCase();
  const type = knownTypes.includes(upperType as NotificationType) ? (upperType as NotificationType) : "SYSTEM";
  return {
    id: item.id,
    type,
    title: item.title,
    body: item.message,
    href: item.link ?? "/mon-compte/notifications",
    read: item.isRead,
    date: new Date(item.createdAt).toLocaleString("fr-FR"),
  };
};

export const listNotifications = async () => {
  const response = await apiRequest<BackendNotification[]>("/notifications");
  return (response.data ?? []).map(toNotification);
};

// Broadcast announcements (opportunités, informations réseau) sent via
// broadcastAdminNotification — same underlying Notification rows as
// listNotifications, filtered to the SYSTEM type before the narrower
// AppNotification mapping above would otherwise fold them into "forum".
export const listMyAnnouncements = async () => {
  const response = await apiRequest<BackendNotification[]>("/notifications");
  return (response.data ?? []).filter((item) => item.type === "SYSTEM");
};

export const markNotificationRead = (id: string, read = true) =>
  apiRequest<BackendNotification>(`/notifications/${id}/read`, { method: "PUT", body: { read } });

export const markAllNotificationsRead = () =>
  apiRequest<null>("/notifications/read-all", { method: "PUT" });
