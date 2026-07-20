import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, MessageSquare, Package, Search, Truck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

type OrderStatus = "pending" | "accepted" | "shipped" | "delivered" | "cancelled";

type SellerOrder = {
  id: string;
  reference: string;
  customer: string;
  item: string;
  amount: number;
  status: OrderStatus;
  date: string;
  city: string;
};

const initialOrders: SellerOrder[] = [
  {
    id: "ord-2408",
    reference: "CMD-2408",
    customer: "Amina Traore",
    item: "Huile de nigelle bio",
    amount: 18500,
    status: "pending",
    date: "08/07/2026",
    city: "Cotonou",
  },
  {
    id: "ord-2399",
    reference: "CMD-2399",
    customer: "Paul Mensah",
    item: "Consultation naturopathie",
    amount: 30000,
    status: "accepted",
    date: "06/07/2026",
    city: "Lome",
  },
  {
    id: "ord-2387",
    reference: "CMD-2387",
    customer: "Nadia Bamba",
    item: "Pack tisane detox",
    amount: 12500,
    status: "shipped",
    date: "04/07/2026",
    city: "Abidjan",
  },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "A traiter",
  accepted: "Acceptee",
  shipped: "Expediee",
  delivered: "Livree",
  cancelled: "Annulee",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  accepted: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-border-light)]",
  shipped: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-border-light)]",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function CommandesPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [message, setMessage] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [order.reference, order.customer, order.item, order.city].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const activeRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.amount, 0);
  const pendingCount = orders.filter((order) => order.status === "pending").length;

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    setMessage(`Commande ${statusLabels[status].toLowerCase()} avec succes.`);
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
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Package} label="Commandes" value={String(orders.length)} />
            <StatCard icon={Clock} label="A traiter" value={String(pendingCount)} />
            <StatCard icon={CheckCircle2} label="Montant actif" value={formatMoney(activeRevenue)} />
          </div>

          <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une reference, un client ou un produit"
                  className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "accepted", "shipped", "delivered", "cancelled"] as const).map((status) => (
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
                        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{order.reference}</h2>
                        <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] font-semibold text-[var(--color-text-primary)]">{order.item}</p>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        {order.customer} - {order.city} - {order.date}
                      </p>
                    </div>
                    <p className="text-[18px] font-extrabold text-[var(--brand-primary)]">{formatMoney(order.amount)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status === "pending" && (
                      <button type="button" onClick={() => updateStatus(order.id, "accepted")} className="btn-primary h-10 px-4 text-[13px]">
                        <CheckCircle2 size={16} /> Accepter
                      </button>
                    )}
                    {(order.status === "accepted" || order.status === "pending") && (
                      <button type="button" onClick={() => updateStatus(order.id, "shipped")} className="btn-secondary h-10 px-4 text-[13px]">
                        <Truck size={16} /> Marquer expediee
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button type="button" onClick={() => updateStatus(order.id, "delivered")} className="btn-secondary h-10 px-4 text-[13px]">
                        <CheckCircle2 size={16} /> Marquer livree
                      </button>
                    )}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <button type="button" onClick={() => updateStatus(order.id, "cancelled")} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 hover:bg-red-100">
                        <XCircle size={16} /> Annuler
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
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
