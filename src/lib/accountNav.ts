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

export type AccountNavItem = {
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
  isLogout?: boolean;
};

export type AccountNavGroup = {
  title: string;
  items: AccountNavItem[];
  proOnly?: boolean;
};

// Single source of truth for the account-area sidebar (AccountLayout), used
// by both /mon-compte/* (all connected accounts) and /tableau-de-bord/*
// (professional-tier accounts). A group or item marked proOnly is filtered
// out for non-professional accounts — see AccountLayout's rendering.
export const ACCOUNT_NAV_GROUPS: AccountNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { icon: LayoutDashboard, label: "Mon espace", to: "/mon-compte" },
      { icon: LayoutDashboard, label: "Tableau de bord pro", to: "/tableau-de-bord", proOnly: true },
    ],
  },
  {
    title: "Achats & activité",
    items: [
      { icon: ShoppingBag, label: "Mes achats", to: "/mes-commandes" },
      { icon: MessageSquare, label: "Messages", to: "/messages" },
      { icon: Wallet, label: "Portefeuille", to: "/mon-compte/portefeuille" },
      { icon: CalendarClock, label: "Mes réservations", to: "/mon-compte/reservations" },
      { icon: FileText, label: "Mes devis", to: "/mon-compte/devis" },
      { icon: Calendar, label: "Inscriptions", to: "/mon-compte/inscriptions" },
      { icon: Sparkles, label: "Favoris", to: "/mon-compte/favoris" },
      { icon: Bell, label: "Alertes", to: "/mon-compte/alertes" },
    ],
  },
  {
    title: "Boutique",
    proOnly: true,
    items: [
      { icon: ShoppingBag, label: "Mes produits", to: "/tableau-de-bord/mes-produits" },
      { icon: Package, label: "Commandes reçues", to: "/tableau-de-bord/commandes" },
      { icon: CalendarClock, label: "Réservations reçues", to: "/tableau-de-bord/reservations" },
      { icon: FileText, label: "Devis à traiter", to: "/tableau-de-bord/devis" },
      { icon: Tag, label: "Coupons", to: "/tableau-de-bord/coupons" },
      { icon: Layers, label: "Mon abonnement", to: "/tableau-de-bord/abonnement" },
    ],
  },
  {
    title: "Profil",
    items: [
      { icon: User, label: "Mon profil", to: "/mon-compte/profil" },
      { icon: User, label: "Vitrine pro", to: "/tableau-de-bord/profil-pro", proOnly: true },
      { icon: Star, label: "Avis reçus", to: "/tableau-de-bord/avis", proOnly: true },
      { icon: FileText, label: "Mon blog", to: "/tableau-de-bord/blog", proOnly: true },
    ],
  },
  {
    title: "Communauté",
    items: [
      { icon: MessageSquare, label: "Mes questions", to: "/mon-compte/questions" },
      { icon: Users, label: "Parrainage", to: "/mon-compte/affiliation", hideForPro: true },
      { icon: GraduationCap, label: "Mes formations", to: "/tableau-de-bord/formations", proOnly: true },
      { icon: Calendar, label: "Mes événements", to: "/tableau-de-bord/evenements", proOnly: true },
      { icon: LifeBuoy, label: "Support utilisateurs", to: "/tableau-de-bord/support", proOnly: true },
    ],
  },
  {
    title: "Réseau",
    proOnly: true,
    items: [
      { icon: Users, label: "Mon réseau", to: "/tableau-de-bord/reseau" },
      { icon: Link2, label: "Affiliation", to: "/tableau-de-bord/affiliation" },
      { icon: Wallet, label: "Commissions", to: "/tableau-de-bord/commissions" },
      { icon: Megaphone, label: "Communication", to: "/tableau-de-bord/communication" },
    ],
  },
  {
    title: "Compte",
    items: [
      { icon: ShieldCheck, label: "KYC", to: "/mon-compte/kyc" },
      { icon: Bell, label: "Notifications", to: "/mon-compte/notifications" },
      { icon: TicketIcon, label: "Tickets support", to: "/mon-compte/tickets" },
      { icon: Settings, label: "Paramètres", to: "/mon-compte/parametres" },
      { icon: LogOut, label: "Déconnexion", isLogout: true },
    ],
  },
];
