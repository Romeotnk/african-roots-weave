import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  Tag,
  User,
  Star,
  FileText,
  MessageSquare,
  GraduationCap,
  Calendar,
  Users,
  Settings,
  Bell,
  ShieldCheck,
  LogOut,
  Leaf,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiRequest, authTokenStore } from "@/lib/api/client";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({ meta: [{ title: "Tableau de bord — IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

const groups = [
  {
    title: "Vue d'ensemble",
    items: [{ icon: LayoutDashboard, label: "Tableau de bord", to: "/tableau-de-bord", active: true }],
  },
  {
    title: "Boutique",
    items: [
      { icon: ShoppingBag, label: "Mes produits", to: "/tableau-de-bord/mes-produits" },
      { icon: Package, label: "Commandes", to: "/tableau-de-bord/commandes" },
      { icon: Wallet, label: "Revenus", to: "/mon-compte/portefeuille" },
      { icon: Tag, label: "Coupons", to: "/tableau-de-bord/coupons" },
    ],
  },
  {
    title: "Profil",
    items: [
      { icon: User, label: "Mon profil", to: "/tableau-de-bord/profil" },
      { icon: Star, label: "Avis reçus", to: "/tableau-de-bord/avis" },
      { icon: FileText, label: "Mon blog", to: "/tableau-de-bord/blog" },
    ],
  },
  {
    title: "Communauté",
    items: [
      { icon: MessageSquare, label: "Mes questions", to: "/tableau-de-bord/questions" },
      { icon: GraduationCap, label: "Mes formations", to: "/tableau-de-bord/formations" },
      { icon: Calendar, label: "Mes événements", to: "/tableau-de-bord/evenements" },
    ],
  },
  {
    title: "Réseau",
    items: [
      { icon: Users, label: "Mon réseau", to: "/tableau-de-bord/reseau" },
      { icon: Users, label: "Affiliations", to: "/mon-compte/affiliation" },
      { icon: Wallet, label: "Commissions", to: "/tableau-de-bord/commissions" },
    ],
  },
  {
    title: "Compte",
    items: [
      { icon: Settings, label: "Paramètres", to: "/tableau-de-bord/parametres" },
      { icon: Bell, label: "Notifications", to: "/mon-compte/notifications" },
      { icon: ShieldCheck, label: "KYC", to: "/mon-compte/kyc" },
      { icon: LogOut, label: "Déconnexion" },
    ],
  },
];

const stats = [
  { label: "Revenus du mois", value: "248 500 FCFA", trend: "+18%", up: true },
  { label: "Commandes actives", value: "14", trend: "+3", up: true },
  { label: "Produits publiés", value: "27", trend: "0", up: true },
  { label: "Messages non lus", value: "8", trend: "-2", up: false },
];

const orders = [
  {
    id: "#10248",
    product: "Tisane post-partum",
    buyer: "Awa D.",
    date: "08/06",
    amount: "8 500",
    status: "Expédiée",
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "#10247",
    product: "Beurre de karité 250g",
    buyer: "Marc L.",
    date: "07/06",
    amount: "6 500",
    status: "Livrée",
    color: "bg-green-50 text-green-700",
  },
  {
    id: "#10246",
    product: "Consultation 60 min",
    buyer: "Henriette B.",
    date: "06/06",
    amount: "25 000",
    status: "En attente",
    color: "bg-orange-50 text-orange-700",
  },
  {
    id: "#10245",
    product: "Ebook Atlas plantes",
    buyer: "Issa K.",
    date: "05/06",
    amount: "12 000",
    status: "Livrée",
    color: "bg-green-50 text-green-700",
  },
];

type AccountProfile = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  language: string;
  kycStatus: string;
  isActive: boolean;
  isBanned: boolean;
  lastLoginAt?: string;
  createdAt?: string;
};

function Dashboard() {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const hasBackendAuth = Boolean(authTokenStore.get());

  const { data: profile } = useQuery<AccountProfile | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiRequest<AccountProfile>("/auth/me");
      return response.data;
    },
    enabled: hasBackendAuth,
    retry: false,
  });

  const fallbackName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Invité";
  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || fallbackName
    : fallbackName;
  const firstName = displayName.split(" ")[0] || "cher utilisateur";
  const roleLabel = roles.includes("admin")
    ? "Admin"
    : roles.includes("professional")
      ? "Praticien"
      : roles.includes("researcher")
        ? "Chercheur"
        : profile?.role === "PROFESSIONAL"
          ? "Praticien"
          : profile?.role === "RESEARCHER"
            ? "Chercheur"
            : "Utilisateur";
  const accountStatus = profile?.isBanned ? "Bloqué" : profile?.isActive ? "Actif" : "Inactif";
  const joinedAt = profile?.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.createdAt))
    : "À définir";
  const lastLoginAt = profile?.lastLoginAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(profile.lastLoginAt))
    : "À définir";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };
  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">

      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-[var(--brand-border-light)] sticky top-0 h-screen overflow-y-auto">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 h-[72px] border-b border-[var(--brand-border-light)]"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white">
            <Leaf size={18} />
          </div>
          <span className="font-extrabold text-[20px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="p-4 border-b border-[var(--brand-border-light)] flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80"
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate">{displayName}</p>
            <span className="text-[10px] bg-[var(--brand-gold)] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-[10px] uppercase tracking-[0.1em] font-bold text-[var(--color-text-muted)] px-3 mb-2">
                {g.title}
              </h4>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const isLogout = it.label === "Déconnexion";
                  const itemClassName = `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] cursor-pointer transition active:scale-[0.98] ${"active" in it && it.active ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-semibold border-l-[3px] border-[var(--brand-primary)] -ml-3 pl-[14px]" : isLogout ? "text-red-600 hover:bg-red-50" : "text-[var(--color-text-secondary)] hover:bg-[var(--brand-surface-alt)]"}`;
                  const to = "to" in it ? it.to : undefined;
                  return (
                    <li key={it.label}>
                      {!to ? (
                        <button onClick={handleLogout} className={itemClassName}>
                          <it.icon size={16} /> {it.label}
                        </button>
                      ) : (
                        <Link to={to as never} className={itemClassName}>
                          <it.icon size={16} /> {it.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-[var(--brand-border-light)] px-5 md:px-8 h-[72px] flex items-center justify-between">
          <div>
            <h1 className="text-[20px] md:text-[24px] font-bold">Bonjour, {firstName} 👋</h1>
            <p className="text-[12px] text-[var(--color-text-muted)]">{profile?.email ?? user?.email ?? "Compte connecté"}</p>
          </div>
          <button className="relative w-10 h-10 rounded-full hover:bg-[var(--brand-surface-alt)] flex items-center justify-center">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--brand-error)]" />
          </button>
        </header>

        <div className="p-5 md:p-8 space-y-6">
          <div className="rounded-[16px] border border-[var(--brand-border-light)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Profil connecté
                </p>
                <h2 className="mt-1 text-[20px] font-bold text-[var(--color-text-primary)]">{displayName}</h2>
                <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{profile?.email ?? user?.email ?? "—"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[12px] bg-[var(--brand-surface-alt)] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Rôle</p>
                  <p className="mt-1 text-[13px] font-semibold">{roleLabel}</p>
                </div>
                <div className="rounded-[12px] bg-[var(--brand-surface-alt)] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Statut</p>
                  <p className="mt-1 text-[13px] font-semibold">{accountStatus}</p>
                </div>
                <div className="rounded-[12px] bg-[var(--brand-surface-alt)] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">KYC</p>
                  <p className="mt-1 text-[13px] font-semibold">{profile?.kycStatus ?? "NON_DÉMARRÉ"}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--brand-border-light)] pt-4 text-[12px] text-[var(--color-text-muted)]">
              <span>Inscrit le {joinedAt}</span>
              <span>Dernière connexion {lastLoginAt}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] border border-[var(--brand-border-light)] p-5"
              >
                <p className="text-[12px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                  {s.label}
                </p>
                <p className="text-[24px] font-extrabold mt-2 text-[var(--color-text-primary)]">
                  {s.value}
                </p>
                <p
                  className={`text-[12px] mt-1 inline-flex items-center gap-1 font-semibold ${s.up ? "text-green-600" : "text-red-600"}`}
                >
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend} vs mois
                  dernier
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Link
              to="/marketplace/deposer"
              className="bg-[var(--brand-primary)] text-white rounded-[12px] p-4 font-semibold text-left hover:bg-[var(--brand-primary-dark)] transition"
            >
              + Ajouter un produit
            </Link>
            <Link
              to="/dashboard/annonces"
              className="bg-white border border-[var(--brand-border)] rounded-[12px] p-4 font-semibold text-left hover:border-[var(--brand-primary)] transition"
            >
              Gerer mes annonces
            </Link>
            <button className="bg-white border border-[var(--brand-border)] rounded-[12px] p-4 font-semibold text-left hover:border-[var(--brand-primary)] transition">
              Voir mes messages
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[12px] border border-[var(--brand-border-light)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--brand-border-light)] flex items-center justify-between">
                <h3 className="font-bold text-[15px]">Commandes récentes</h3>
                <a className="text-[12px] font-semibold text-[var(--brand-primary)] cursor-pointer">
                  Tout voir →
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--brand-surface-alt)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    <tr>
                      <th className="text-left px-5 py-3">ID</th>
                      <th className="text-left px-5 py-3">Produit</th>
                      <th className="text-left px-5 py-3">Acheteur</th>
                      <th className="text-left px-5 py-3">Montant</th>
                      <th className="text-left px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-[var(--brand-border-light)]">
                        <td className="px-5 py-3 font-mono text-[12px]">{o.id}</td>
                        <td className="px-5 py-3">{o.product}</td>
                        <td className="px-5 py-3 text-[var(--color-text-muted)]">{o.buyer}</td>
                        <td className="px-5 py-3 font-semibold">{o.amount}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-semibold ${o.color}`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[var(--brand-border-light)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--brand-border-light)] flex items-center justify-between">
                <h3 className="font-bold text-[15px]">Messages récents</h3>
                <a className="text-[12px] font-semibold text-[var(--brand-primary)] cursor-pointer">
                  Tout voir →
                </a>
              </div>
              <ul>
                {[
                  [
                    "Awa D.",
                    "Bonjour, est-ce que la tisane est sans danger pendant l'allaitement ?",
                    "il y a 12 min",
                  ],
                  [
                    "Marc L.",
                    "Merci pour la livraison rapide ! Avez-vous d'autres produits...",
                    "il y a 1h",
                  ],
                  [
                    "Henriette B.",
                    "Je souhaiterais reporter mon rendez-vous de jeudi",
                    "il y a 3h",
                  ],
                  ["Issa K.", "L'ebook est-il téléchargeable plusieurs fois ?", "hier"],
                ].map(([n, m, t]) => (
                  <li
                    key={n}
                    className="px-5 py-4 border-t border-[var(--brand-border-light)] flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--brand-primary-subtle)] flex items-center justify-center font-bold text-[var(--brand-primary)] text-[12px]">
                      {n.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-semibold text-[14px]">{n}</p>
                        <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">
                          {t}
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                        {m}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
