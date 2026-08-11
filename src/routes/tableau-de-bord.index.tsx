import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare, Package } from "lucide-react";
import { useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { useMeQuery } from "@/hooks/useAuthApi";
import { useMyOrders } from "@/hooks/useOrdersApi";
import { useMyProducts } from "@/hooks/useApiCatalog";
import { listConversations } from "@/lib/api/messages";
import { authTokenStore } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";

export const Route = createFileRoute("/tableau-de-bord/")({
  head: () => ({ meta: [{ title: "Tableau de bord - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={PROFESSIONAL_ACCOUNT_ROLES}>
      <Dashboard />
    </ProtectedRoute>
  ),
});

type PrismaOrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "REFUNDED" | "CANCELLED";

type BackendOrder = {
  id: string;
  totalAmount: string | number;
  status: PrismaOrderStatus;
  createdAt: string;
  product?: { title: string } | null;
  buyer?: { firstName: string; lastName: string } | null;
};

const orderStatusLabels: Record<PrismaOrderStatus, string> = {
  PENDING: "En attente de paiement",
  PAID: "A expedier",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  DISPUTED: "En litige",
  REFUNDED: "Remboursee",
  CANCELLED: "Annulee",
};

const orderStatusClasses: Record<PrismaOrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PAID: "bg-orange-50 text-orange-700",
  SHIPPED: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  DELIVERED: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  DISPUTED: "bg-red-50 text-red-700",
  REFUNDED: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useMeQuery();
  const hasBackendAuth = Boolean(authTokenStore.get());

  const ordersQuery = useMyOrders("seller");
  const productsQuery = useMyProducts();
  const conversationsQuery = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: listConversations,
    enabled: hasBackendAuth,
    retry: false,
  });

  const orders = (ordersQuery.data?.data ?? []) as BackendOrder[];
  const products = productsQuery.data ?? [];
  const conversations = conversationsQuery.data ?? [];

  const monthlyRevenue = useMemo(() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return orders
      .filter((order) => new Date(order.createdAt) >= startOfMonth && !["CANCELLED", "REFUNDED"].includes(order.status))
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  }, [orders]);

  const activeOrdersCount = orders.filter((order) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)).length;
  const publishedProductsCount = products.filter((product) => product.isActive && product.isApproved).length;
  const unreadMessagesCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  const stats = [
    { label: "Revenus du mois", value: formatMoney(monthlyRevenue) },
    { label: "Commandes actives", value: String(activeOrdersCount) },
    { label: "Produits publies", value: String(publishedProductsCount) },
    { label: "Messages non lus", value: String(unreadMessagesCount) },
  ];

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [orders],
  );

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .filter((conversation) => conversation.messages.length > 0)
        .sort((a, b) => new Date(b.messages.at(-1)!.createdAt).getTime() - new Date(a.messages.at(-1)!.createdAt).getTime())
        .slice(0, 4),
    [conversations],
  );

  const isLoading = ordersQuery.isLoading || productsQuery.isLoading || conversationsQuery.isLoading;

  const fallbackName = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "Invite";
  const displayName = profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || fallbackName : fallbackName;
  const firstName = displayName.split(" ")[0] || "cher utilisateur";
  const accountStatus = profile?.isBanned ? "Bloque" : profile?.isActive ? "Actif" : "Inactif";
  const joinedAt = profile?.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.createdAt))
    : "A definir";
  const lastLoginAt = profile?.lastLoginAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(profile.lastLoginAt))
    : "A definir";

  return (
    <AccountLayout title={`Bonjour, ${firstName}`} description={profile?.email ?? user?.email ?? "Compte connecte"}>
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Profil connecte</p>
              <h2 className="mt-1 text-[20px] font-bold text-[var(--color-text-primary)]">{displayName}</h2>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{profile?.email ?? user?.email ?? "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniInfo label="Role" value="Professionnel" />
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
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delayMs={staggerDelay(index, 60, 240)}>
              <div className="relative overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
                <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--brand-primary)]" />
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="mt-2 text-[24px] font-extrabold text-[var(--color-text-primary)]">{isLoading ? "-" : stat.value}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <ActionLink to="/marketplace/deposer" primary label="Ajouter un produit" />
          <ActionLink to="/tableau-de-bord/mes-produits" label="Gerer mes annonces" />
          <ActionLink to="/messages" label="Voir mes messages" />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--brand-border-light)] px-5 py-4">
              <h3 className="text-[15px] font-bold">Commandes recentes</h3>
              <Link to="/tableau-de-bord/commandes" className="text-[12px] font-semibold text-[var(--brand-primary)]">Tout voir</Link>
            </div>
            {ordersQuery.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={24} />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="mx-auto text-[var(--brand-primary)]" size={28} />
                <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">Aucune commande pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--brand-surface-alt)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    <tr><th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Produit</th><th className="px-5 py-3 text-left">Acheteur</th><th className="px-5 py-3 text-left">Montant</th><th className="px-5 py-3 text-left">Statut</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-t border-[var(--brand-border-light)]">
                        <td className="px-5 py-3 font-mono text-[12px]">{order.id.slice(0, 8)}</td>
                        <td className="px-5 py-3">{order.product?.title ?? "Commande"}</td>
                        <td className="px-5 py-3 text-[var(--color-text-muted)]">{order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "Client"}</td>
                        <td className="px-5 py-3 font-semibold">{formatMoney(Number(order.totalAmount))}</td>
                        <td className="px-5 py-3"><span className={`rounded px-2 py-1 text-[11px] font-semibold ${orderStatusClasses[order.status]}`}>{orderStatusLabels[order.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--brand-border-light)] px-5 py-4">
              <h3 className="text-[15px] font-bold">Messages recents</h3>
              <Link to="/messages" className="text-[12px] font-semibold text-[var(--brand-primary)]">Tout voir</Link>
            </div>
            {conversationsQuery.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={24} />
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto text-[var(--brand-primary)]" size={28} />
                <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">Aucun message pour le moment.</p>
              </div>
            ) : (
              <ul>
                {recentConversations.map((conversation) => {
                  const last = conversation.messages.at(-1)!;
                  return (
                    <li key={conversation.id} className="flex gap-3 border-t border-[var(--brand-border-light)] px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[12px] font-bold text-[var(--brand-primary)]">{conversation.participantName.charAt(0)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2"><p className="text-[14px] font-semibold">{conversation.participantName}</p><span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">{formatDateTime(last.createdAt)}</span></div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">{last.content}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AccountLayout>
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
