import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminModerationActions, usePendingProducts } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/marketplace")({
  head: () => ({ meta: [{ title: "Admin marketplace - IWOSAN" }] }),
  component: AdminMarketplace,
});

type PendingProduct = {
  id: string;
  title: string;
  price: string | number;
  category: string;
  categoryLabel?: string;
  type: string;
  createdAt: string;
};

function AdminMarketplace() {
  const { t } = useTranslation();
  const pendingQuery = usePendingProducts();
  const { approveProduct, rejectProduct } = useAdminModerationActions();
  const [rejectTarget, setRejectTarget] = useState<PendingProduct | null>(null);
  const [notice, setNotice] = useState("");

  const products = (pendingQuery.data?.data ?? []) as PendingProduct[];

  return (
    <AdminLayout title={t("admin.marketplaceModeration.title")} description={t("admin.marketplaceModeration.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {pendingQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.marketplaceModeration.loading")}</p>}
      {pendingQuery.isError && <p className="text-[13px] text-red-300">{t("admin.marketplaceModeration.loadError")}</p>}

      {!pendingQuery.isLoading && !pendingQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.marketplaceModeration.colListing"), t("admin.marketplaceModeration.colCategory"), t("admin.marketplaceModeration.colType"), t("admin.marketplaceModeration.colPrice"), t("admin.marketplaceModeration.colSubmittedOn"), t("admin.marketplaceModeration.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.marketplaceModeration.noPendingListings")}</td></tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{product.title}</td>
                  <td className="px-4 py-3 text-slate-200">{product.categoryLabel ?? product.category}</td>
                  <td className="px-4 py-3 text-slate-200">{product.type}</td>
                  <td className="px-4 py-3 text-slate-200">{Number(product.price).toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(product.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={approveProduct.isPending}
                        onClick={() => approveProduct.mutate(product.id, { onSuccess: () => setNotice(t("admin.marketplaceModeration.approved", { title: product.title })) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.marketplaceModeration.approve")}
                      </button>
                      <button type="button" onClick={() => setRejectTarget(product)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        {t("admin.marketplaceModeration.reject")}
                      </button>
                    </div>
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
        title={t("admin.marketplaceModeration.rejectTitle", { title: rejectTarget?.title ?? "" })}
        description={t("admin.marketplaceModeration.rejectDesc")}
        danger
        requireReason
        reasonLabel={t("admin.marketplaceModeration.rejectReasonLabel")}
        confirmLabel={t("admin.marketplaceModeration.reject")}
        pending={rejectProduct.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget || !reason) return;
          rejectProduct.mutate(
            { id: rejectTarget.id, reason },
            { onSuccess: () => { setNotice(t("admin.marketplaceModeration.rejected", { title: rejectTarget.title })); setRejectTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
