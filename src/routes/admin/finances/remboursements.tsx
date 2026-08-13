import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRefundActions, useAdminRefundRequests } from "@/hooks/useAdminApi";
import type { AdminOrder } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/finances/remboursements")({
  head: () => ({ meta: [{ title: "Admin remboursements - IWOSAN" }] }),
  component: AdminRemboursements,
});

function AdminRemboursements() {
  const { t } = useTranslation();
  const statusLabel: Record<string, string> = {
    REQUESTED: t("admin.refunds.statusRequested"),
    APPROVED: t("admin.refunds.statusApproved"),
    REJECTED: t("admin.refunds.statusRejected"),
    PROCESSED: t("admin.refunds.statusProcessed"),
  };
  const [status, setStatus] = useState("REQUESTED");
  const refundsQuery = useAdminRefundRequests({ status: status || undefined });
  const { approve, reject } = useAdminRefundActions();
  const [rejectTarget, setRejectTarget] = useState<AdminOrder | null>(null);
  const [notice, setNotice] = useState("");

  const orders = refundsQuery.data?.data ?? [];

  return (
    <AdminLayout title={t("admin.refunds.title")} description={t("admin.refunds.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-4 flex gap-2">
        {["REQUESTED", "APPROVED", "PROCESSED", "REJECTED", ""].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${status === value ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
          >
            {value ? statusLabel[value] : t("admin.refunds.all")}
          </button>
        ))}
      </div>

      {refundsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.refunds.loading")}</p>}
      {refundsQuery.isError && <p className="text-[13px] text-red-300">{t("admin.refunds.loadError")}</p>}

      {!refundsQuery.isLoading && !refundsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.refunds.colOrder"), t("admin.refunds.colBuyer"), t("admin.refunds.colSeller"), t("admin.refunds.colAmount"), t("admin.refunds.colReason"), t("admin.refunds.colSellerAck"), t("admin.refunds.colStatus"), t("admin.refunds.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">{t("admin.refunds.noRequests")}</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{order.product.title}</td>
                  <td className="px-4 py-3 text-slate-200">{order.buyer.firstName} {order.buyer.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{order.seller.firstName} {order.seller.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{Number(order.totalAmount).toLocaleString("fr-FR")} FCFA</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">{order.disputeReason ?? "—"}</td>
                  <td className="max-w-[200px] px-4 py-3 text-slate-400" title={order.sellerRefundNote ?? undefined}>
                    {order.sellerAcknowledgedAt ? (
                      <span className="text-emerald-300">✓ {new Date(order.sellerAcknowledgedAt).toLocaleDateString("fr-FR")}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-slate-300">
                      {order.refundStatus ? statusLabel[order.refundStatus] : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.refundStatus === "REQUESTED" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={approve.isPending}
                          onClick={() =>
                            approve.mutate({ id: order.id }, { onSuccess: () => setNotice(t("admin.refunds.approvedAndProcessed")) })
                          }
                          className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                        >
                          {t("admin.refunds.approve")}
                        </button>
                        <button type="button" onClick={() => setRejectTarget(order)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                          {t("admin.refunds.reject")}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("admin.refunds.rejectRequestTitle")}
        danger
        requireReason
        reasonLabel={t("admin.refunds.rejectReasonLabel")}
        confirmLabel={t("admin.refunds.reject")}
        pending={reject.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget || !reason) return;
          reject.mutate(
            { id: rejectTarget.id, reason },
            { onSuccess: () => { setNotice(t("admin.refunds.requestRejected")); setRejectTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
