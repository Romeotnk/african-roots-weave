import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminDisputeActions, useAdminDisputes } from "@/hooks/useAdminApi";
import type { AdminOrder } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/finances/litiges")({
  head: () => ({ meta: [{ title: "Admin litiges - IWOSAN" }] }),
  component: AdminLitiges,
});

function AdminLitiges() {
  const { t } = useTranslation();
  const disputesQuery = useAdminDisputes();
  const { resolve } = useAdminDisputeActions();
  const [target, setTarget] = useState<{ order: AdminOrder; resolution: "REFUND_BUYER" | "RELEASE_SELLER" } | null>(null);
  const [notice, setNotice] = useState("");

  const orders = disputesQuery.data?.data ?? [];

  return (
    <AdminLayout title={t("admin.disputes.title")} description={t("admin.disputes.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {disputesQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.disputes.loading")}</p>}
      {disputesQuery.isError && <p className="text-[13px] text-red-300">{t("admin.disputes.loadError")}</p>}

      {!disputesQuery.isLoading && !disputesQuery.isError && (
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="rounded-[12px] border border-white/10 bg-white/[0.04] p-6 text-center text-[13px] text-slate-400">
              {t("admin.disputes.noDisputes")}
            </div>
          )}
          {orders.map((order) => (
            <div key={order.id} className="rounded-[12px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[16px] font-bold text-white">{order.product.title}</p>
                  <p className="mt-1 text-[13px] text-slate-400">
                    {t("admin.disputes.buyerSellerLine", {
                      buyerName: `${order.buyer.firstName} ${order.buyer.lastName}`,
                      buyerEmail: order.buyer.email,
                      sellerName: `${order.seller.firstName} ${order.seller.lastName}`,
                      sellerEmail: order.seller.email,
                    })}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-300">{t("admin.disputes.amount", { amount: `${Number(order.totalAmount).toLocaleString("fr-FR")} FCFA` })}</p>
                  {order.disputeReason && (
                    <p className="mt-2 rounded-lg bg-white/5 p-3 text-[13px] text-slate-300">« {order.disputeReason} »</p>
                  )}
                  {order.sellerAcknowledgedAt ? (
                    <p className="mt-2 text-[12px] font-semibold text-emerald-300">
                      {t("admin.disputes.sellerAckOn", { date: new Date(order.sellerAcknowledgedAt).toLocaleDateString("fr-FR") })}
                      {order.sellerRefundNote ? ` — « ${order.sellerRefundNote} »` : ""}
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] text-slate-500">{t("admin.disputes.noSellerAckYet")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTarget({ order, resolution: "REFUND_BUYER" })}
                    className="rounded-full bg-red-500/80 px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    {t("admin.disputes.refundBuyer")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget({ order, resolution: "RELEASE_SELLER" })}
                    className="rounded-full bg-emerald-400 px-3 py-1.5 text-[12px] font-bold text-[#111827]"
                  >
                    {t("admin.disputes.releaseSeller")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title={
          target?.resolution === "REFUND_BUYER"
            ? t("admin.disputes.refundBuyerTitle")
            : t("admin.disputes.releaseSellerTitle")
        }
        description={
          target?.resolution === "REFUND_BUYER"
            ? t("admin.disputes.refundBuyerDesc")
            : t("admin.disputes.releaseSellerDesc")
        }
        danger
        requireReason
        reasonLabel={t("admin.disputes.decisionReasonLabel")}
        confirmLabel={t("admin.disputes.confirm")}
        pending={resolve.isPending}
        onConfirm={(reason) => {
          if (!target || !reason) return;
          resolve.mutate(
            { id: target.order.id, resolution: target.resolution, reason },
            { onSuccess: () => { setNotice(t("admin.disputes.resolved")); setTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
