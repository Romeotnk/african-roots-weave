import type { TFunction } from "i18next";
import type { EventItem } from "@/types";

const fallbackEventImage = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop";

export type BackendEvent = {
  id?: string;
  title?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  location?: string | null;
  isOnline?: boolean;
  meetingUrl?: string | null;
  description?: string;
  coverImage?: string | null;
  maxAttendees?: number | null;
  registrations?: unknown[];
};

export function toEventItem(event: BackendEvent, t: TFunction): EventItem | null {
  if (!event.id || !event.title || !event.startDate) return null;
  return {
    id: event.id,
    title: event.title,
    type: (event.type as EventItem["type"]) ?? "SALON",
    category: event.type ? String(event.type).toLowerCase() : "Evenement",
    date: event.startDate,
    endDate: event.endDate,
    location: event.isOnline ? t("eventMappers.online") : (event.location ?? t("eventMappers.locationToConfirm")),
    online: Boolean(event.isOnline),
    meetingUrl: event.meetingUrl ?? undefined,
    description: event.description ?? t("eventMappers.detailsComingSoon"),
    image: event.coverImage ?? fallbackEventImage,
    capacity: event.maxAttendees ?? undefined,
    registered: event.registrations?.length,
    status: "confirmed",
  };
}
