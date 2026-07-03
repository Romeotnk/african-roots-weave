import { notifications as fallbackNotifications, type AppNotification, type NotificationType } from "@/data/notifications";
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

const knownTypes: NotificationType[] = ["message", "listing", "order", "review", "forum"];

export const toNotification = (item: BackendNotification): AppNotification => {
  const lowerType = item.type.toLowerCase();
  const type = knownTypes.includes(lowerType as NotificationType) ? (lowerType as NotificationType) : "forum";
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

export const markNotificationRead = (id: string) =>
  apiRequest<BackendNotification>(`/notifications/${id}/read`, { method: "PUT" });

export const markAllNotificationsRead = () =>
  apiRequest<null>("/notifications/read-all", { method: "PUT" });

export const getNotificationsWithFallback = async () => {
  try {
    return await listNotifications();
  } catch {
    return fallbackNotifications;
  }
};
