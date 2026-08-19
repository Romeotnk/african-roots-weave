import {
  Bell,
  CalendarClock,
  FileText,
  Gavel,
  GraduationCap,
  Megaphone,
  MessageSquare,
  PackageCheck,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// Real backend notification type strings (see server/src/services/notification.service.ts
// createNotification() call sites). KYC_APPROVED/KYC_REJECTED/BOOKING_CONFIRMED/
// BOOKING_CANCELLED/REVIEW_RECEIVED are emitted starting with the notification-trigger
// expansion (booking status changes, review received, KYC decisions).
export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_PAID"
  | "ORDER_SHIPPED"
  | "ORDER_REFUNDED"
  | "AUCTION_WON"
  | "AUCTION_CLOSED"
  | "BID_OUTBID"
  | "SYSTEM"
  | "SAVED_SEARCH_MATCH"
  | "NEW_MESSAGE"
  | "COMMISSION_EARNED"
  | "QUOTE_REQUESTED"
  | "QUOTE_PROPOSED"
  | "QUOTE_DECLINED"
  | "QUOTE_ACCEPTED"
  | "FORMATION_ENROLLED"
  | "FORMATION_SOLD"
  | "KYC_SUBMITTED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "REVIEW_RECEIVED"
  | "ADMIN_BROADCAST"
  | "TICKET_REPLY";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  date: string;
}

// Single source of truth for the type→icon mapping, shared by NotificationBell
// (dropdown panel) and the full notification history page — kept here rather
// than duplicated in both, since they were previously two independent copies
// that had already drifted (one used the broken 5-word type list, one didn't).
export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  ORDER_CREATED: PackageCheck,
  ORDER_PAID: PackageCheck,
  ORDER_SHIPPED: PackageCheck,
  ORDER_REFUNDED: PackageCheck,
  AUCTION_WON: Trophy,
  AUCTION_CLOSED: Gavel,
  BID_OUTBID: Gavel,
  SYSTEM: Bell,
  SAVED_SEARCH_MATCH: Search,
  NEW_MESSAGE: MessageSquare,
  COMMISSION_EARNED: Wallet,
  QUOTE_REQUESTED: FileText,
  QUOTE_PROPOSED: FileText,
  QUOTE_DECLINED: FileText,
  QUOTE_ACCEPTED: FileText,
  FORMATION_ENROLLED: GraduationCap,
  FORMATION_SOLD: GraduationCap,
  KYC_SUBMITTED: ShieldCheck,
  KYC_APPROVED: ShieldCheck,
  KYC_REJECTED: ShieldCheck,
  BOOKING_CONFIRMED: CalendarClock,
  BOOKING_CANCELLED: CalendarClock,
  REVIEW_RECEIVED: Star,
  ADMIN_BROADCAST: Megaphone,
  TICKET_REPLY: Ticket,
};
