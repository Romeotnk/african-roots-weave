import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest, authTokenStore } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({ meta: [{ title: "Tableau de bord - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <Dashboard />
    </ProtectedRoute>
  ),
});

const groups = [
  { title: "Vue d'ensemble", items: [{ icon: LayoutDashboard, label: "Tableau de bord", to: "/tableau-de-bord", active: true }] },
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
      { icon: Star, label: "Avis recus", to: "/tableau-de-bord/avis" },
      { icon: FileText, label: "Mon blog", to: "/tableau-de-bord/blog" },
    ],
  },
  {
    title: "Communaute",
    items: [
      { icon: MessageSquare, label: "Mes questions", to: "/tableau-de-bord/questions" },
      { icon: GraduationCap, label: "Mes formations", to: "/tableau-de-bord/formations" },
      { icon: Calendar, label: "Mes evenements", to: "/tableau-de-bord/evenements" },
    ],
  },
  {
    title: "Reseau",
    items: [
      { icon: Users, label: "Mon reseau", to: "/tableau-de-bord/reseau" },
      { icon: Users, label: "Affiliations", to: "/mon-compte/affiliation" },
      { icon: Wallet, label: "Commissions", to: "/tableau-de-bord/commissions" },
    ],
  },
  {
    title: "Compte",
    items: [
      { icon: Settings, label: "Parametres", to: "/tableau-de-bord/parametres" },
      { icon: Bell, label: "Notifications", to: "/mon-compte/notifications" },
      { icon: ShieldCheck, label: "KYC", to: "/mon-compte/kyc" },
      { icon: LogOut, label: "Deconnexion" },
    ],
  },
];

const stats = [
  { label: "Revenus du mois", value: "248 500 FCFA", trend: "+18%", up: true },
  { label: "Commandes actives", value: "14", trend: "+3", up: true },
  { label: "Produits publies", value: "27", trend: "0", up: true },
  { label: "Messages non lus", value: "8", trend: "-2", up: false },
];

const orders = [
  { id: "#10248", product: "Tisane post-partum", buyer: "Awa D.", amount: "8 500", status: "Expediee", color: "bg-blue-50 text-blue-700" },
  { id: "#10247", product: "Beurre de karite 250g", buyer: "Marc L.", amount: "6 500", status: "Livree", color: "bg-green-50 text-green-700" },
  { id: "#10246", product: "Consultation 60 min", buyer: "Henriette B.", amount: "25 000", status: "En attente", color: "bg-orange-50 text-orange-700" },
  { id: "#10245", product: "Ebook Atlas plantes", buyer: "Issa K.", amount: "12 000", status: "Livree", color: "bg-green-50 text-green-700" },
];

const messages = [
  ["Awa D.", "Bonjour, est-ce que la tisane est sans danger pendant l'allaitement ?", "il y a 12 min"],
  ["Marc L.", "Merci pour la livraison rapide ! Avez-vous d'autres produits ?", "il y a 1h"],
  ["Henriette B.", "Je souhaiterais reporter mon rendez-vous de jeudi", "il y a 3h"],
  ["Issa K.", "L'ebook est-il telechargeable plusieurs fois ?", "hier"],
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

  const fallbackName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Invite";
  const displayName = profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || fallbackName : fallbackName;
  const firstName = displayName.split(" ")[0] || "cher utilisateur";
  const roleLabel = roles.includes("admin")
    ? "Admin"
    : roles.includes("professional") || roles.includes("researcher") || profile?.role === "PROFESSIONAL" || profile?.role === "RESEARCHER"
      ? "Professionnel"
      : "Utilisateur";
  const accountStatus = profile?.isBanned ? "Bloque" : profile?.isActive ? "Actif" : "Inactif";
  const joinedAt = profile?.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.createdAt))
    : "A definir";
  const lastLoginAt = profile?.lastLoginAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(profile.lastLoginAt))
    : "A definir";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">
      <aside className="hidden h-screen w-[260px] flex-col overflow-y-auto border-r border-[var(--brand-border-light)] bg-white md:flex">
        <Link to="/" className="flex h-[72px] items-center gap-2 border-b border-[var(--brand-border-light)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--brand-primary)] text-white"><Leaf size={18} /></div>
          <span className="text-[20px] font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="flex items-center gap-3 border-b border-[var(--brand-border-light)] p-4">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80" className="h-10 w-10 rounded-full object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{displayName}</p>
            <span className="rounded bg-[var(--brand-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{roleLabel}</span>
          </div>
        </div>
        <nav className="flex-1 space-y-5 p-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{group.title}</h4>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isLogout = item.label === "Deconnexion";
                  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] transition active:scale-[0.98] ${
                    "active" in item && item.active
                      ? "bg-[var(--brand-primary-subtle)] font-semibold text-[var(--brand-primary)]"
                      : isLogout
                        ? "text-red-600 hover:bg-red-50"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--brand-surface-alt)]"
                  }`;
                  return (
                    <li key={item.label}>
                      {"to" in item ? (
                        <Link to={item.to as never} className={className}><item.icon size={16} /> {item.label}</Link>
                      ) : (
                        <button type="button" onClick={handleLogout} className={className}><item.icon size={16} /> {item.label}</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[var(--brand-border-light)] bg-white px-5 md:px-8">
          <div>
            <h1 className="text-[20px] font-bold md:text-[24px]">Bonjour, {firstName}</h1>
            <p className="text-[12px] text-[var(--color-text-muted)]">{profile?.email ?? user?.email ?? "Compte connecte"}</p>
          </div>
          <Link to="/mon-compte/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--brand-surface-alt)]" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--brand-error)]" />
          </Link>
        </header>

        <div className="space-y-6 p-5 md:p-8">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Profil connecte</p>
                <h2 className="mt-1 text-[20px] font-bold text-[var(--color-text-primary)]">{displayName}</h2>
                <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{profile?.email ?? user?.email ?? "-"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniInfo label="Role" value={roleLabel} />
                <MiniInfo label="Statut" value={accountStatus} />
                <MiniInfo label="KYC" value={profile?.kycStatus ?? "NON_DEMARRE"} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--brand-border-light)] pt-4 text-[12px] text-[var(--color-text-muted)]">
              <span>Inscrit le {joinedAt}</span>
              <span>Derniere connexion {lastLoginAt}</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="mt-2 text-[24px] font-extrabold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className={`mt-1 inline-flex items-center gap-1 text-[12px] font-semibold ${stat.up ? "text-green-600" : "text-red-600"}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {stat.trend} vs mois dernier
                </p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <ActionLink to="/marketplace/deposer" primary label="Ajouter un produit" />
            <ActionLink to="/dashboard/annonces" label="Gerer mes annonces" />
            <ActionLink to="/messages" label="Voir mes messages" />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--brand-border-light)] px-5 py-4">
                <h3 className="text-[15px] font-bold">Commandes recentes</h3>
                <Link to="/tableau-de-bord/commandes" className="text-[12px] font-semibold text-[var(--brand-primary)]">Tout voir</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--brand-surface-alt)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    <tr><th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Produit</th><th className="px-5 py-3 text-left">Acheteur</th><th className="px-5 py-3 text-left">Montant</th><th className="px-5 py-3 text-left">Statut</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-[var(--brand-border-light)]">
                        <td className="px-5 py-3 font-mono text-[12px]">{order.id}</td>
                        <td className="px-5 py-3">{order.product}</td>
                        <td className="px-5 py-3 text-[var(--color-text-muted)]">{order.buyer}</td>
                        <td className="px-5 py-3 font-semibold">{order.amount}</td>
                        <td className="px-5 py-3"><span className={`rounded px-2 py-1 text-[11px] font-semibold ${order.color}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--brand-border-light)] px-5 py-4">
                <h3 className="text-[15px] font-bold">Messages recents</h3>
                <Link to="/messages" className="text-[12px] font-semibold text-[var(--brand-primary)]">Tout voir</Link>
              </div>
              <ul>
                {messages.map(([name, text, time]) => (
                  <li key={`${name}-${time}`} className="flex gap-3 border-t border-[var(--brand-border-light)] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[12px] font-bold text-[var(--brand-primary)]">{name.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2"><p className="text-[14px] font-semibold">{name}</p><span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">{time}</span></div>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[var(--brand-surface-alt)] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold">{value}</p>
    </div>
  );
}

function ActionLink({ to, label, primary = false }: { to: string; label: string; primary?: boolean }) {
  return (
    <Link
      to={to as never}
      className={`rounded-[12px] p-4 text-left font-semibold transition ${
        primary
          ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]"
          : "border border-[var(--brand-border)] bg-white hover:border-[var(--brand-primary)]"
      }`}
    >
      {label}
    </Link>
  );
}