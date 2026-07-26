import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, MessageSquare, Package, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { useMarkOrderShipped, useMyOrders, useOpenOrderDispute } from "@/hooks/useOrdersApi";

type PrismaOrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "REFUNDED" | "CANCELLED";

type BackendOrder = {
  id: string;
  buyerId: string;
  quantity: number;
  totalAmount: string | number;
  status: PrismaOrderStatus;
  createdAt: string;
  product?: { id: string; title: string } | null;
  buyer?: { firstName: string; lastName: string } | null;
};

const statusLabels: Record<PrismaOrderStatus, string> = {
  PENDING: "En attente de paiement",
  PAID: "A expedier",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  DISPUTED: "En litige",
  REFUNDED: "Remboursee",
  CANCELLED: "Annulee",
};

const statusClasses: Record<PrismaOrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  PAID: "bg-amber-50 text-amber-700 border-amber-100",
  SHIPPED: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-border-light)]",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DISPUTED: "bg-red-50 text-red-700 border-red-100",
  REFUNDED: "bg-red-50 text-red-700 border-red-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function CommandesPage() {
  const ordersQuery = useMyOrders("seller");
  const markShipped = useMarkOrderShipped();
  const openDispute = useOpenOrderDispute();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PrismaOrderStatus>("all");
  const [message, setMessage] = useState("");

  const orders = (ordersQuery.data?.data ?? []) as BackendOrder[];

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const customer = order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "";
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [order.id, customer, order.product?.title ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const activeRevenue = orders
    .filter((order) => !["CANCELLED", "REFUNDED"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const toShipCount = orders.filter((order) => order.status === "PAID").length;

  const shipOrder = (id: string) => {
    markShipped.mutate(id, {
      onSuccess: () => setMessage("Commande marquee comme expediee."),
      onError: (error) => setMessage(error instanceof Error ? error.message : "Impossible de marquer la commande comme expediee."),
    });
  };

  const disputeOrder = (id: string) => {
    const reason = window.prompt("Motif du litige a signaler pour cette commande :");
    if (!reason) return;
    openDispute.mutate(
      { orderId: id, reason },
      {
        onSuccess: () => setMessage("Litige signale pour cette commande."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Impossible de signaler le litige."),
      },
    );
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Boutique</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">Commandes</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Traitez les commandes recues, informez les clients et suivez les expeditions.
                </p>
              </div>
              <Link to="/messages" className="btn-secondary h-11 px-5 text-[14px]">
                <MessageSquare size={17} /> Messages clients
              </Link>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
          {ordersQuery.isLoading && <p className="text-[13px] text-[var(--color-text-muted)]">Chargement...</p>}
          {ordersQuery.isError && <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">Impossible de charger les commandes.</p>}

          {!ordersQuery.isLoading && !ordersQuery.isError && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard icon={Package} label="Commandes" value={String(orders.length)} />
                <StatCard icon={Clock} label="A expedier" value={String(toShipCount)} />
                <StatCard icon={CheckCircle2} label="Montant actif" value={formatMoney(activeRevenue)} />
              </div>

              <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="relative block min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Rechercher une commande, un client ou un produit"
                      className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "PAID", "SHIPPED", "DELIVERED", "DISPUTED"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                          statusFilter === status
                            ? "bg-[var(--brand-primary)] text-white"
                            : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {status === "all" ? "Toutes" : statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
                {message && <p className="mt-3 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              </div>

              <div className="mt-5 space-y-3">
                {filteredOrders.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredOrders.map((order) => (
                    <article key={order.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{order.product?.title ?? "Commande"}</h2>
                            <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                            {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "Client"} · {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.quantity} article(s)
                          </p>
                        </div>
                        <p className="text-[18px] font-extrabold text-[var(--brand-primary)]">{formatMoney(Number(order.totalAmount))}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.status === "PAID" && (
                          <button
                            type="button"
                            onClick={() => shipOrder(order.id)}
                            disabled={markShipped.isPending}
                            className="btn-primary h-10 px-4 text-[13px] disabled:opacity-50"
                          >
                            <Truck size={16} /> Marquer expediee
                          </button>
                        )}
                        {!["DELIVERED", "REFUNDED", "CANCELLED", "DISPUTED"].includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => disputeOrder(order.id)}
                            disabled={openDispute.isPending}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <AlertTriangle size={16} /> Signaler un litige
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
      <Package className="mx-auto text-[var(--brand-primary)]" size={34} />
      <h2 className="mt-4 text-[20px] font-bold">Aucune commande trouvee</h2>
      <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Modifiez la recherche ou le filtre pour afficher d'autres commandes.</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/commandes")({
  head: () => ({ meta: [{ title: "Commandes - IWOSAN" }] }),
  component: CommandesPage,
});
