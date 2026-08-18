import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminKeys, useAdminModerationActions, usePendingProducts } from "@/hooks/useAdminApi";
import { useUpdateProduct } from "@/hooks/useApiCatalog";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";

export const Route = createFileRoute("/admin/marketplace")({
  head: () => ({ meta: [{ title: "Admin marketplace - IWOSAN" }] }),
  component: AdminMarketplace,
});

type PendingProduct = {
  id: string;
  title: string;
  description?: string;
  price: string | number;
  category: string;
  categoryLabel?: string;
  type: string;
  stock?: number | null;
  createdAt: string;
};

function AdminMarketplace() {
  const { t } = useTranslation();
  const pendingQuery = usePendingProducts();
  const { approveProduct, rejectProduct } = useAdminModerationActions();
  const [rejectTarget, setRejectTarget] = useState<PendingProduct | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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
                <Fragment key={product.id}>
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-3 font-semibold text-white">{product.title}</td>
                    <td className="px-4 py-3 text-slate-200">{product.categoryLabel ?? product.category}</td>
                    <td className="px-4 py-3 text-slate-200">{product.type}</td>
                    <td className="px-4 py-3 text-slate-200">{Number(product.price).toLocaleString("fr-FR")} FCFA</td>
                    <td className="px-4 py-3 text-slate-200">{new Date(product.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId((current) => (current === product.id ? null : product.id))}
                          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white"
                        >
                          <Pencil size={12} /> {t("admin.marketplaceModeration.edit")}
                        </button>
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
                  {editingId === product.id && (
                    <tr className="border-t border-white/10 bg-white/[0.03]">
                      <td colSpan={6} className="px-4 py-4">
                        <AdminProductEditForm
                          product={product}
                          onClose={() => setEditingId(null)}
                          onSaved={() => {
                            setEditingId(null);
                            setNotice(t("admin.marketplaceModeration.updated", { title: product.title }));
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
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

function AdminProductEditForm({
  product,
  onClose,
  onSaved,
}: {
  product: PendingProduct;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const updateProduct = useUpdateProduct();
  const taxonomyQuery = useTaxonomy("PRODUCT_CATEGORY");
  const allCategories = useMemo(() => taxonomyQuery.data ?? [], [taxonomyQuery.data]);

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock ?? 0));
  const [categoryId, setCategoryId] = useState(allCategories.find((item) => item.slug === product.category)?.id ?? "");
  const [error, setError] = useState("");

  const selectedCategory = allCategories.find((item) => item.id === categoryId);

  const save = () => {
    setError("");
    if (title.trim().length < 3) {
      setError(t("admin.marketplaceModeration.editTitleTooShort"));
      return;
    }
    if (description.trim().length < 10) {
      setError(t("admin.marketplaceModeration.editDescriptionTooShort"));
      return;
    }
    updateProduct.mutate(
      {
        id: product.id,
        payload: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          category: selectedCategory?.slug ?? product.category,
          stock: product.type === "DIGITAL" ? undefined : Number(stock) || 0,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: adminKeys.productsPending });
          onSaved();
        },
        onError: (err) => setError(err instanceof Error ? err.message : t("admin.marketplaceModeration.editGenericError")),
      },
    );
  };

  return (
    <div className="space-y-3 rounded-[8px] border border-white/10 bg-white/[0.03] p-4">
      <label className="block text-[12px] font-semibold text-slate-300">
        {t("admin.marketplaceModeration.editFieldTitle")}
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
        />
      </label>
      <label className="block text-[12px] font-semibold text-slate-300">
        {t("admin.marketplaceModeration.editFieldDescription")}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-emerald-400"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-[12px] font-semibold text-slate-300">
          {t("admin.marketplaceModeration.editFieldPrice")}
          <input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
          />
        </label>
        {product.type !== "DIGITAL" && (
          <label className="block text-[12px] font-semibold text-slate-300">
            {t("admin.marketplaceModeration.editFieldStock")}
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
            />
          </label>
        )}
        <label className="block text-[12px] font-semibold text-slate-300">
          {t("admin.marketplaceModeration.editFieldCategory")}
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
          >
            {allCategories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="text-[13px] font-semibold text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={updateProduct.isPending}
          className="rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
        >
          {updateProduct.isPending ? t("admin.marketplaceModeration.editSaving") : t("admin.marketplaceModeration.editSave")}
        </button>
        <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80">
          {t("admin.marketplaceModeration.editCancel")}
        </button>
      </div>
    </div>
  );
}
