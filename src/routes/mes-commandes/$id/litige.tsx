import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMyOrders, useOpenOrderDispute, useRequestOrderRefund } from "@/hooks/useOrdersApi";

export const Route = createFileRoute("/mes-commandes/$id/litige")({
  head: () => ({ meta: [{ title: "Litige - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "professional", "admin", "super_admin"]}>
      <DisputePage />
    </ProtectedRoute>
  ),
});

type BackendOrder = {
  id: string;
  status: string;
  disputeReason?: string | null;
  refundStatus?: string | null;
};

const reasons = [
  "Produit non reçu",
  "Produit différent de l'annonce",
  "Produit endommagé",
  "Service non réalisé",
  "Autre problème",
];

function buildReasonLabels(t: TFunction): Record<string, string> {
  return {
    "Produit non reçu": t("dispute.reasonNotReceived"),
    "Produit différent de l'annonce": t("dispute.reasonDifferentFromListing"),
    "Produit endommagé": t("dispute.reasonDamaged"),
    "Service non réalisé": t("dispute.reasonServiceNotDone"),
    "Autre problème": t("dispute.reasonOther"),
  };
}

function buildRefundStatusLabels(t: TFunction): Record<string, string> {
  return {
    REQUESTED: t("dispute.refundStatusRequested"),
    APPROVED: t("dispute.refundStatusApproved"),
    REJECTED: t("dispute.refundStatusRejected"),
    PROCESSED: t("dispute.refundStatusProcessed"),
  };
}

function DisputePage() {
  const { t } = useTranslation();
  const reasonLabels = buildReasonLabels(t);
  const refundStatusLabels = buildRefundStatusLabels(t);
  const { id } = Route.useParams();
  const ordersQuery = useMyOrders("buyer");
  const openDispute = useOpenOrderDispute();
  const requestRefund = useRequestOrderRefund();
  const [action, setAction] = useState<"dispute" | "refund">("dispute");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const order = ((ordersQuery.data?.data ?? []) as BackendOrder[]).find((item) => item.id === id);

  const submitDispute = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanDescription = description.trim();
    setFormError("");
    setFormMessage("");

    if (!reason) {
      setFormError(t("dispute.reasonRequired"));
      return;
    }

    if (cleanDescription.length < 25) {
      setFormError(t("dispute.descriptionTooShort"));
      return;
    }

    const fullReason = `${reason} — ${cleanDescription}`;
    const mutation = action === "dispute" ? openDispute : requestRefund;
    mutation.mutate(
      { orderId: id, reason: fullReason },
      {
        onSuccess: () =>
          setFormMessage(
            action === "dispute"
              ? t("dispute.disputeSubmitted")
              : t("dispute.refundSubmitted"),
          ),
        onError: (error) => setFormError(error instanceof Error ? error.message : t("dispute.submitError")),
      },
    );
  };

  const isPending = openDispute.isPending || requestRefund.isPending;
  const submitted = Boolean(order?.status === "DISPUTED" || order?.refundStatus);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            {t("dispute.orderLabel", { id })}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">{t("dispute.title")}</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            {t("dispute.description")}
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submitDispute} className="space-y-5 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <div>
            <p className="text-[13px] font-semibold">{t("dispute.requestType")}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAction("dispute")}
                className={`h-11 flex-1 rounded-lg border text-[13px] font-semibold ${action === "dispute" ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}
              >
                {t("dispute.reportDispute")}
              </button>
              <button
                type="button"
                onClick={() => setAction("refund")}
                className={`h-11 flex-1 rounded-lg border text-[13px] font-semibold ${action === "refund" ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}
              >
                {t("dispute.requestRefund")}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold" htmlFor="dispute-reason">{t("dispute.reasonLabel")}</label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
            >
              <option value="">{t("dispute.selectReason")}</option>
              {reasons.map((item) => (
                <option key={item} value={item}>{reasonLabels[item]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-semibold" htmlFor="dispute-description">{t("dispute.detailedDescription")}</label>
            <textarea
              id="dispute-description"
              rows={7}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("dispute.descriptionPlaceholder")}
              className="mt-2 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{t("dispute.minChars", { count: description.trim().length })}</p>
          </div>

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{formError}</p>
          )}
          {formMessage && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">{formMessage}</p>
          )}

          <button type="submit" disabled={isPending} className="h-11 rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white disabled:opacity-60">
            {isPending ? t("dispute.sending") : t("dispute.submit")}
          </button>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="font-bold">{t("dispute.tracking")}</h2>
          {order?.disputeReason && (
            <p className="mt-3 rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
              <span className="font-semibold">{t("dispute.recordedReason")}</span> {order.disputeReason}
            </p>
          )}
          <div className="mt-4 space-y-2 text-[13px]">
            <p>
              <span className="font-semibold">{t("dispute.orderStatus")}</span>{" "}
              {order?.status === "DISPUTED" ? t("dispute.orderStatusDisputed") : order?.status ?? "—"}
            </p>
            {order?.refundStatus && (
              <p>
                <span className="font-semibold">{t("dispute.refundLabel")}</span>{" "}
                {refundStatusLabels[order.refundStatus] ?? order.refundStatus}
              </p>
            )}
          </div>
          <div className="mt-5 rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
            {submitted ? t("dispute.caseRecorded") : t("dispute.noActiveRequest")}
          </div>
          <Link to="/mes-commandes" className="mt-5 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
            {t("dispute.backToOrders")}
          </Link>
        </aside>
      </section>
    </main>
  );
}
