import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MessageSquare, PackageCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useConfirmOrderDelivery, useMyOrders } from "@/hooks/useOrdersApi";
import { useCreateReview } from "@/hooks/useReviewsApi";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Order, OrderStatus } from "@/types";

export const Route = createFileRoute("/mes-commandes/")({
  head: () => ({ meta: [{ title: "Mes commandes - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "professional", "admin", "super_admin"]}>
      <OrdersPage />
    </ProtectedRoute>
  ),
});

function buildTimeline(t: TFunction): { id: OrderStatus; label: string }[] {
  return [
    { id: "confirmed", label: t("myOrders.timelineConfirmed") },
    { id: "paid", label: t("myOrders.timelinePaid") },
    { id: "shipped", label: t("myOrders.timelineShipped") },
    { id: "delivered", label: t("myOrders.timelineDelivered") },
  ];
}

type BackendOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  product?: { id: string; title: string; slug: string; images: string[] } | null;
};

const statusMap: Record<string, OrderStatus> = {
  PENDING: "confirmed",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  DISPUTED: "delivered",
  REFUNDED: "completed",
  CANCELLED: "confirmed",
};

function toOrder(order: BackendOrder, myUserId: string | undefined, t: TFunction): Order {
  return {
    id: order.id,
    role: order.buyerId === myUserId ? "buyer" : "seller",
    date: order.createdAt.slice(0, 10),
    status: statusMap[order.status] ?? "confirmed",
    total: Number(order.totalAmount),
    items: [{ title: order.product?.title ?? t("myOrders.defaultProduct"), seller: "", quantity: order.quantity, price: Number(order.totalAmount) }],
  };
}

type ReviewDraft = { rating: number; comment: string; submitted?: boolean };

function OrdersPage() {
  const { t } = useTranslation();
  const timeline = buildTimeline(t);
  const { user } = useAuth();
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const ordersQuery = useMyOrders("all");
  const confirmDelivery = useConfirmOrderDelivery();
  const createReview = useCreateReview();

  const apiOrders = useMemo(() => {
    const raw = (ordersQuery.data?.data ?? []) as (BackendOrder & { productId?: string })[];
    return raw.map((order) => toOrder(order, user?.id, t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersQuery.data, user?.id]);
  const rawOrders = (ordersQuery.data?.data ?? []) as (BackendOrder & { productId?: string })[];

  const [actionMessage, setActionMessage] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [orderReviews, setOrderReviews] = useState<Record<string, ReviewDraft>>({});
  const [buyerRatings, setBuyerRatings] = useState<Record<string, { rating: number; comment: string; submitted?: boolean }>>({});
  const filtered = apiOrders.filter((order) => order.role === tab);

  const confirmReception = (orderId: string) => {
    confirmDelivery.mutate(orderId, {
      onSuccess: () => setActionMessage(t("myOrders.receptionConfirmedFor", { id: orderId })),
      onError: (error) => setActionMessage(error instanceof Error ? error.message : t("myOrders.confirmationError")),
    });
  };

  const openReview = (orderId: string) => {
    setReviewOrderId((current) => (current === orderId ? "" : orderId));
    setOrderReviews((current) => ({
      ...current,
      [orderId]: current[orderId] ?? { rating: 5, comment: "" },
    }));
  };

  const submitReview = (orderId: string) => {
    const review = orderReviews[orderId];
    if (!review?.rating) {
      setActionMessage(t("myOrders.chooseRatingBeforeReview"));
      return;
    }

    const productId = rawOrders.find((order) => order.id === orderId)?.product?.id;
    if (!productId) {
      setActionMessage(t("myOrders.cannotIdentifyProduct"));
      return;
    }

    createReview.mutate(
      { targetId: productId, targetType: "PRODUCT", rating: review.rating, comment: review.comment || undefined },
      {
        onSuccess: () => {
          setOrderReviews((current) => ({ ...current, [orderId]: { ...review, submitted: true } }));
          setReviewOrderId("");
          setActionMessage(t("myOrders.reviewSavedFor", { id: orderId }));
        },
        onError: (error) => setActionMessage(error instanceof Error ? error.message : t("myOrders.reviewSaveError")),
      },
    );
  };

  const submitBuyerRating = (orderId: string) => {
    const draft = buyerRatings[orderId];
    if (!draft?.rating) {
      setActionMessage(t("myOrders.chooseRatingBeforeEvaluation"));
      return;
    }

    const buyerId = rawOrders.find((order) => order.id === orderId)?.buyerId;
    if (!buyerId) {
      setActionMessage(t("myOrders.cannotIdentifyBuyer"));
      return;
    }

    createReview.mutate(
      { targetId: buyerId, targetType: "BUYER", rating: draft.rating, comment: draft.comment || undefined },
      {
        onSuccess: () => {
          setBuyerRatings((current) => ({ ...current, [orderId]: { ...draft, submitted: true } }));
          setActionMessage(t("myOrders.evaluationSavedFor", { id: orderId }));
        },
        onError: (error) => setActionMessage(error instanceof Error ? error.message : t("myOrders.evaluationSaveError")),
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <h1 className="text-[32px] md:text-[42px]">{t("myOrders.title")}</h1>
          <div className="mt-5 inline-flex rounded-full border border-[var(--brand-border)] bg-white p-1">
            {[
              ["buyer", t("myOrders.buyer")],
              ["seller", t("myOrders.seller")],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as "buyer" | "seller")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === value ? "bg-[var(--brand-primary)] text-white" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8 space-y-4">
        {actionMessage && (
          <p className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        {ordersQuery.isLoading ? (
          <div className="flex items-center justify-center rounded-[12px] border border-[var(--brand-border-light)] bg-white p-10">
            <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
          </div>
        ) : ordersQuery.isError ? (
          <div className="rounded-[12px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
            {t("myOrders.loadError")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
            <h2 className="text-[20px] font-bold">{t("myOrders.emptyTitle")}</h2>
            <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
              {t("myOrders.emptyDesc")}
            </p>
          </div>
        ) : null}

        {!ordersQuery.isLoading && !ordersQuery.isError && filtered.map((order) => {
          const statusIndex = timeline.findIndex((step) => step.id === order.status);
          const canConfirmReception = tab === "buyer" && (order.status === "paid" || order.status === "shipped");
          const receptionConfirmed = order.status === "delivered" || order.status === "completed";
          const review = orderReviews[order.id];

          return (
            <article key={order.id} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold">{order.id}</h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {t("myOrders.orderMeta", { date: order.date, total: order.total.toLocaleString("fr-FR") })}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
                  {timeline[statusIndex]?.label ?? order.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {timeline.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index <= statusIndex ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-muted)]"}`}>
                      <CheckCircle2 size={15} />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold">{step.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {order.items.map((item) => (
                  <div key={item.title} className="flex justify-between rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                    <span>{item.quantity} x {item.title}</span>
                    <strong>{item.price.toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/mes-commandes/$id/litige"
                  params={{ id: order.id }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
                >
                  <MessageSquare size={15} /> {t("myOrders.reportProblem")}
                </Link>

                {tab === "buyer" && (
                  <>
                    <button
                      type="button"
                      onClick={() => confirmReception(order.id)}
                      disabled={!canConfirmReception || confirmDelivery.isPending}
                      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold ${canConfirmReception ? "bg-[var(--brand-primary)] text-white" : "cursor-not-allowed bg-[var(--brand-surface-alt)] text-[var(--color-text-muted)]"}`}
                    >
                      <PackageCheck size={15} /> {receptionConfirmed ? t("myOrders.receptionConfirmed") : canConfirmReception ? t("myOrders.confirmReception") : t("myOrders.waitForDelivery")}
                    </button>
                    <button
                      type="button"
                      onClick={() => openReview(order.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
                    >
                      <Star size={15} /> {review?.submitted ? t("myOrders.editReview") : t("myOrders.leaveReview")}
                    </button>
                  </>
                )}
              </div>

              {tab === "buyer" && reviewOrderId === order.id && (
                <div className="mt-5 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{t("myOrders.yourReview")}</h3>
                      <p className="text-[13px] text-[var(--color-text-muted)]">
                        {t("myOrders.rateExperience")}
                      </p>
                    </div>
                    {review?.submitted && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                        {t("myOrders.reviewAlreadySaved")}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setOrderReviews((current) => ({ ...current, [order.id]: { rating: value, comment: current[order.id]?.comment ?? "", submitted: false } }))}
                        className={`grid h-10 w-10 place-items-center rounded-full border ${review?.rating >= value ? "border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--brand-primary-dark)]" : "border-[var(--brand-border)] bg-white"}`}
                        aria-label={t("myOrders.starsLabel", { count: value })}
                      >
                        <Star size={16} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review?.comment ?? ""}
                    onChange={(event) => setOrderReviews((current) => ({ ...current, [order.id]: { rating: current[order.id]?.rating ?? 5, comment: event.target.value, submitted: false } }))}
                    placeholder={t("myOrders.commentOptional")}
                    className="mt-3 min-h-20 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => submitReview(order.id)}
                    disabled={createReview.isPending}
                    className="mt-3 h-10 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                  >
                    {createReview.isPending ? t("myOrders.sending") : t("myOrders.saveReview")}
                  </button>
                </div>
              )}

              {tab === "seller" && ["delivered", "completed"].includes(order.status) && (
                <div className="mt-5 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{t("myOrders.rateBuyer")}</h3>
                      <p className="text-[13px] text-[var(--color-text-muted)]">
                        {t("myOrders.reliabilityScoreNotice")}
                      </p>
                    </div>
                    {buyerRatings[order.id]?.submitted && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                        {t("myOrders.ratingSent", { rating: buyerRatings[order.id].rating })}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBuyerRatings((current) => ({ ...current, [order.id]: { rating: value, comment: current[order.id]?.comment ?? "" } }))}
                        className={`grid h-10 w-10 place-items-center rounded-full border ${buyerRatings[order.id]?.rating >= value ? "border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--brand-primary-dark)]" : "border-[var(--brand-border)] bg-white"}`}
                        aria-label={t("myOrders.starsLabel", { count: value })}
                      >
                        <Star size={16} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={buyerRatings[order.id]?.comment ?? ""}
                    onChange={(event) => setBuyerRatings((current) => ({ ...current, [order.id]: { rating: current[order.id]?.rating ?? 5, comment: event.target.value } }))}
                    placeholder={t("myOrders.commentOptional")}
                    className="mt-3 min-h-20 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => submitBuyerRating(order.id)}
                    disabled={createReview.isPending || buyerRatings[order.id]?.submitted}
                    className="mt-3 h-10 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                  >
                    {createReview.isPending ? t("myOrders.sending") : buyerRatings[order.id]?.submitted ? t("myOrders.evaluationSent") : t("myOrders.sendEvaluation")}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
