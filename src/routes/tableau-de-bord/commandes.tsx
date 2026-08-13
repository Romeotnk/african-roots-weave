import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, MessageSquare, Package, Search, ShieldCheck, Star, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAcknowledgeOrderRefund, useMarkOrderShipped, useMyOrders, useOpenOrderDispute } from "@/hooks/useOrdersApi";
import { useCreateReview } from "@/hooks/useReviewsApi";

type PrismaOrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "REFUNDED" | "CANCELLED";
type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSED";

type BackendOrder = {
  id: string;
  buyerId: string;
  quantity: number;
  totalAmount: string | number;
  status: PrismaOrderStatus;
  createdAt: string;
  disputeReason?: string | null;
  refundStatus?: RefundStatus | null;
  sellerRefundNote?: string | null;
  sellerAcknowledgedAt?: string | null;
  product?: { id: string; title: string } | null;
  buyer?: { firstName: string; lastName: string } | null;
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
  const { t } = useTranslation();
  const statusLabels: Record<PrismaOrderStatus, string> = {
    PENDING: t("dashboard.orders.statusPending"),
    PAID: t("dashboard.orders.statusPaid"),
    SHIPPED: t("dashboard.orders.statusShipped"),
    DELIVERED: t("dashboard.orders.statusDelivered"),
    DISPUTED: t("dashboard.orders.statusDisputed"),
    REFUNDED: t("dashboard.orders.statusRefunded"),
    CANCELLED: t("dashboard.orders.statusCancelled"),
  };
  const ordersQuery = useMyOrders("seller");
  const markShipped = useMarkOrderShipped();
  const openDispute = useOpenOrderDispute();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PrismaOrderStatus>("all");
  const [message, setMessage] = useState("");
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

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
      onSuccess: () => setMessage(t("dashboard.orders.shipped")),
      onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.orders.shipError")),
    });
  };

  const disputeOrder = (id: string) => {
    const reason = window.prompt(t("dashboard.orders.disputeReasonPrompt"));
    if (!reason) return;
    openDispute.mutate(
      { orderId: id, reason },
      {
        onSuccess: () => setMessage(t("dashboard.orders.disputeReported")),
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.orders.disputeError")),
      },
    );
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout
        title={t("dashboard.orders.title")}
        description={t("dashboard.orders.description")}
        actions={
          <Link to="/messages" className="btn-secondary h-11 px-5 text-[14px]">
            <MessageSquare size={17} /> {t("dashboard.orders.customerMessages")}
          </Link>
        }
      >
          {ordersQuery.isLoading && <p className="text-[13px] text-[var(--color-text-muted)]">{t("dashboard.orders.loading")}</p>}
          {ordersQuery.isError && <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{t("dashboard.orders.loadError")}</p>}

          {!ordersQuery.isLoading && !ordersQuery.isError && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard icon={Package} label={t("dashboard.orders.statOrders")} value={String(orders.length)} />
                <StatCard icon={Clock} label={t("dashboard.orders.statToShip")} value={String(toShipCount)} />
                <StatCard icon={CheckCircle2} label={t("dashboard.orders.statActiveAmount")} value={formatMoney(activeRevenue)} />
              </div>

              <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="relative block min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("dashboard.orders.searchPlaceholder")}
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
                        {status === "all" ? t("dashboard.orders.all") : statusLabels[status]}
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
                            <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{order.product?.title ?? t("dashboard.orders.defaultOrderTitle")}</h2>
                            <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                            {t("dashboard.orders.orderSummary", {
                              customer: order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : t("dashboard.orders.defaultCustomer"),
                              date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
                              count: order.quantity,
                            })}
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
                            <Truck size={16} /> {t("dashboard.orders.markShipped")}
                          </button>
                        )}
                        {!["DELIVERED", "REFUNDED", "CANCELLED", "DISPUTED"].includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => disputeOrder(order.id)}
                            disabled={openDispute.isPending}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <AlertTriangle size={16} /> {t("dashboard.orders.reportDispute")}
                          </button>
                        )}
                        {order.status === "DELIVERED" && (
                          <button
                            type="button"
                            onClick={() => setRatingOrderId((current) => (current === order.id ? null : order.id))}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
                          >
                            <Star size={16} /> {t("dashboard.orders.rateCustomer")}
                          </button>
                        )}
                      </div>
                      {ratingOrderId === order.id && (
                        <BuyerRatingForm buyerId={order.buyerId} onDone={(text) => { setMessage(text); setRatingOrderId(null); }} />
                      )}
                      {(order.refundStatus || order.status === "DISPUTED") && (
                        <RefundPanel order={order} onDone={setMessage} />
                      )}
                    </article>
                  ))
                )}
              </div>
            </>
          )}
      </AccountLayout>
    </ProtectedRoute>
  );
}

function BuyerRatingForm({ buyerId, onDone }: { buyerId: string; onDone: (message: string) => void }) {
  const { t } = useTranslation();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    createReview.mutate(
      { targetId: buyerId, targetType: "BUYER", rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => onDone(t("dashboard.orders.customerRated")),
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("dashboard.orders.ratingError")),
      },
    );
  };

  return (
    <div className="mt-4 rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} aria-label={t("dashboard.orders.starsLabel", { count: value })}>
            <Star size={20} className={value <= rating ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]" : "text-[var(--brand-border)]"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        placeholder={t("dashboard.orders.commentPlaceholder")}
        className="mt-3 w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-[13px]"
      />
      {error && <p className="mt-2 text-[12px] font-semibold text-red-700">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={createReview.isPending}
        className="mt-3 h-9 rounded-full bg-[var(--brand-primary)] px-4 text-[12px] font-semibold text-white disabled:opacity-60"
      >
        {createReview.isPending ? t("dashboard.orders.sending") : t("dashboard.orders.sendRating")}
      </button>
    </div>
  );
}

function RefundPanel({ order, onDone }: { order: BackendOrder; onDone: (message: string) => void }) {
  const { t } = useTranslation();
  const acknowledgeRefund = useAcknowledgeOrderRefund();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const refundStatusLabels: Record<RefundStatus, string> = {
    REQUESTED: t("dashboard.orders.refundRequested"),
    APPROVED: t("dashboard.orders.refundApproved"),
    REJECTED: t("dashboard.orders.refundRejected"),
    PROCESSED: t("dashboard.orders.refundProcessed"),
  };

  const submit = () => {
    setError("");
    acknowledgeRefund.mutate(
      { orderId: order.id, note: note.trim() || undefined },
      {
        onSuccess: () => onDone(t("dashboard.orders.acknowledgeSent")),
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("dashboard.orders.acknowledgeError")),
      },
    );
  };

  return (
    <div className="mt-4 rounded-[8px] border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle size={16} className="text-amber-700" />
        <p className="text-[13px] font-bold text-amber-800">
          {order.status === "DISPUTED" ? t("dashboard.orders.disputeInProgress") : t("dashboard.orders.refundRequestTitle")}
        </p>
        {order.refundStatus && (
          <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[12px] font-semibold text-amber-800">
            {refundStatusLabels[order.refundStatus]}
          </span>
        )}
      </div>
      {order.disputeReason && (
        <p className="mt-2 text-[13px] text-amber-900"><span className="font-semibold">{t("dashboard.orders.reasonLabel")}</span> {order.disputeReason}</p>
      )}
      <p className="mt-2 text-[12px] text-amber-800">
        {t("dashboard.orders.refundDecisionNotice")}
      </p>

      {order.sellerAcknowledgedAt ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
          <ShieldCheck size={16} /> {t("dashboard.orders.acknowledgedOn", { date: new Date(order.sellerAcknowledgedAt).toLocaleDateString("fr-FR") })}
          {order.sellerRefundNote ? ` — "${order.sellerRefundNote}"` : ""}
        </p>
      ) : (
        <>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder={t("dashboard.orders.acknowledgeNotePlaceholder")}
            className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[13px]"
          />
          {error && <p className="mt-2 text-[12px] font-semibold text-red-700">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={acknowledgeRefund.isPending}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-amber-700 px-4 text-[12px] font-semibold text-white disabled:opacity-60"
          >
            <ShieldCheck size={14} /> {acknowledgeRefund.isPending ? t("dashboard.orders.sending") : t("dashboard.orders.acknowledge")}
          </button>
        </>
      )}
    </div>
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
  const { t } = useTranslation();
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
      <Package className="mx-auto text-[var(--brand-primary)]" size={34} />
      <h2 className="mt-4 text-[20px] font-bold">{t("dashboard.orders.emptyTitle")}</h2>
      <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.orders.emptyDesc")}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/commandes")({
  head: () => ({ meta: [{ title: "Commandes - IWOSAN" }] }),
  component: CommandesPage,
});
