import {
  Bell,
  Calendar,
  CalendarClock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Link2,
  LogOut,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Ticket as TicketIcon,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { TFunction } from "i18next";

export type AccountNavItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  to?: string;
  // Only shown when the connected account has a professional-tier role
  // (see isProfessionalAccount in src/lib/auth/roles.ts).
  proOnly?: boolean;
  // Opposite of proOnly: hidden for professional-tier accounts. Used for
  // the general-audience MLM page (/mon-compte/affiliation), which would
  // otherwise duplicate the pro-only "Mon réseau" entry below.
  hideForPro?: boolean;
  // Only shown for accounts that are commercially a professional (a real
  // seller/practitioner) — hidden for admin/super_admin, who inherited
  // professional-tier *permissions* through the role merge but aren't
  // merchants (see isPureProfessional in src/lib/auth/roles.ts). Storefront,
  // sales and KYC self-submission belong here; content/moderation tools
  // legitimately shared with staff (blog, forum, formations...) don't.
  commercialOnly?: boolean;
  isLogout?: boolean;
};

export type AccountNavGroup = {
  id: string;
  title: string;
  items: AccountNavItem[];
  proOnly?: boolean;
  commercialOnly?: boolean;
};

// Single source of truth for the account-area sidebar (AccountLayout), used
// by both /mon-compte/* (all connected accounts) and /tableau-de-bord/*
// (professional-tier accounts). A group or item marked proOnly is filtered
// out for non-professional accounts — see AccountLayout's rendering.
export function buildAccountNavGroups(t: TFunction): AccountNavGroup[] {
  return [
    {
      id: "overview",
      title: t("accountNav.groupOverview"),
      items: [
        { id: "mySpace", icon: LayoutDashboard, label: t("accountNav.mySpace"), to: "/mon-compte" },
        { id: "proDashboard", icon: LayoutDashboard, label: t("accountNav.proDashboard"), to: "/tableau-de-bord", proOnly: true },
      ],
    },
    {
      id: "purchasesActivity",
      title: t("accountNav.groupPurchasesActivity"),
      items: [
        { id: "myPurchases", icon: ShoppingBag, label: t("accountNav.myPurchases"), to: "/mes-commandes" },
        { id: "messages", icon: MessageSquare, label: t("accountNav.messages"), to: "/messages" },
        { id: "wallet", icon: Wallet, label: t("accountNav.wallet"), to: "/mon-compte/portefeuille" },
        { id: "myBookings", icon: CalendarClock, label: t("accountNav.myBookings"), to: "/mon-compte/reservations" },
        { id: "myQuotes", icon: FileText, label: t("accountNav.myQuotes"), to: "/mon-compte/devis" },
        { id: "registrations", icon: Calendar, label: t("accountNav.registrations"), to: "/mon-compte/inscriptions" },
        { id: "favorites", icon: Sparkles, label: t("accountNav.favorites"), to: "/mon-compte/favoris" },
        { id: "alerts", icon: Bell, label: t("accountNav.alerts"), to: "/mon-compte/alertes" },
      ],
    },
    {
      id: "shop",
      title: t("accountNav.groupShop"),
      proOnly: true,
      commercialOnly: true,
      items: [
        { id: "myProducts", icon: ShoppingBag, label: t("accountNav.myProducts"), to: "/tableau-de-bord/mes-produits" },
        { id: "receivedOrders", icon: Package, label: t("accountNav.receivedOrders"), to: "/tableau-de-bord/commandes" },
        { id: "receivedBookings", icon: CalendarClock, label: t("accountNav.receivedBookings"), to: "/tableau-de-bord/reservations" },
        { id: "quotesToHandle", icon: FileText, label: t("accountNav.quotesToHandle"), to: "/tableau-de-bord/devis" },
        { id: "coupons", icon: Tag, label: t("accountNav.coupons"), to: "/tableau-de-bord/coupons" },
        { id: "mySubscription", icon: Layers, label: t("accountNav.mySubscription"), to: "/tableau-de-bord/abonnement" },
      ],
    },
    {
      id: "profile",
      title: t("accountNav.groupProfile"),
      items: [
        { id: "myProfile", icon: User, label: t("accountNav.myProfile"), to: "/mon-compte/profil" },
        { id: "proShowcase", icon: User, label: t("accountNav.proShowcase"), to: "/tableau-de-bord/profil-pro", proOnly: true, commercialOnly: true },
        { id: "receivedReviews", icon: Star, label: t("accountNav.receivedReviews"), to: "/tableau-de-bord/avis", proOnly: true, commercialOnly: true },
        { id: "myBlog", icon: FileText, label: t("accountNav.myBlog"), to: "/tableau-de-bord/blog", proOnly: true },
      ],
    },
    {
      id: "community",
      title: t("accountNav.groupCommunity"),
      items: [
        { id: "myQuestions", icon: MessageSquare, label: t("accountNav.myQuestions"), to: "/mon-compte/questions" },
        { id: "referral", icon: Users, label: t("accountNav.referral"), to: "/mon-compte/affiliation", hideForPro: true },
        { id: "myTrainings", icon: GraduationCap, label: t("accountNav.myTrainings"), to: "/tableau-de-bord/formations", proOnly: true },
        { id: "myEvents", icon: Calendar, label: t("accountNav.myEvents"), to: "/tableau-de-bord/evenements", proOnly: true },
        { id: "userSupport", icon: LifeBuoy, label: t("accountNav.userSupport"), to: "/tableau-de-bord/support", proOnly: true },
      ],
    },
    {
      id: "network",
      title: t("accountNav.groupNetwork"),
      proOnly: true,
      commercialOnly: true,
      items: [
        { id: "myNetwork", icon: Users, label: t("accountNav.myNetwork"), to: "/tableau-de-bord/reseau" },
        { id: "affiliation", icon: Link2, label: t("accountNav.affiliation"), to: "/tableau-de-bord/affiliation" },
        { id: "commissions", icon: Wallet, label: t("accountNav.commissions"), to: "/tableau-de-bord/commissions" },
        { id: "communication", icon: Megaphone, label: t("accountNav.communication"), to: "/tableau-de-bord/communication" },
      ],
    },
    {
      id: "account",
      title: t("accountNav.groupAccount"),
      items: [
        // Admin/super_admin are exempt from KYC server-side (kyc.middleware.ts) —
        // showing this as if it were required for them is misleading.
        { id: "kyc", icon: ShieldCheck, label: t("accountNav.kyc"), to: "/mon-compte/kyc", commercialOnly: true },
        { id: "notifications", icon: Bell, label: t("accountNav.notifications"), to: "/mon-compte/notifications" },
        { id: "supportTickets", icon: TicketIcon, label: t("accountNav.supportTickets"), to: "/mon-compte/tickets" },
        { id: "settings", icon: Settings, label: t("accountNav.settings"), to: "/mon-compte/parametres" },
        { id: "logout", icon: LogOut, label: t("accountNav.logout"), isLogout: true },
      ],
    },
  ];
}
