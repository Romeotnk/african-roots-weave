import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Archive, Eye, Flame, Loader2, PackageCheck, Pencil, Plus, RefreshCw, Search, ShoppingBag, Sparkles, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useBoostProduct, useMarkProductUrgent, useMyProducts, useRenewProduct, useUpdateProduct, useUploadProductImages } from "@/hooks/useApiCatalog";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";
import type { MyProduct } from "@/lib/api/catalog";

type DisplayStatus = "published" | "review" | "paused";

const statusClasses: Record<DisplayStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  review: "bg-amber-50 text-amber-700 border-amber-100",
  paused: "bg-red-50 text-red-700 border-red-100",
};

const getStatus = (product: MyProduct): DisplayStatus => {
  if (!product.isActive) return "paused";
  if (!product.isApproved) return "review";
  return "published";
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

const isExpiringSoon = (expiresAt: string | null) => {
  if (!expiresAt) return false;
  const daysLeft = (new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  return daysLeft <= 7;
};

function MesProduitsPage() {
  const { t } = useTranslation();
  const statusLabels: Record<DisplayStatus, string> = {
    published: t("dashboard.myProducts.statusPublished"),
    review: t("dashboard.myProducts.statusReview"),
    paused: t("dashboard.myProducts.statusPaused"),
  };
  const { data: products, isLoading, isError } = useMyProducts();
  const updateProduct = useUpdateProduct();
  const renewProduct = useRenewProduct();
  const boostProduct = useBoostProduct();
  const markUrgent = useMarkProductUrgent();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      const matchesStatus = statusFilter === "all" || getStatus(product) === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.title, product.category].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [products, query, statusFilter]);

  const publishedCount = (products ?? []).filter((product) => getStatus(product) === "published").length;
  const lowStockCount = (products ?? []).filter((product) => product.type !== "digital" && product.stock <= 10).length;
  const totalViews = (products ?? []).reduce((sum, product) => sum + product.viewCount, 0);

  const togglePublish = (product: MyProduct) => {
    updateProduct.mutate(
      { id: product.id, payload: { isActive: !product.isActive } },
      {
        onSuccess: () => setMessage(product.isActive ? t("dashboard.myProducts.paused") : t("dashboard.myProducts.published")),
        onError: () => setMessage(t("dashboard.myProducts.genericError")),
      },
    );
  };

  const adjustStock = (product: MyProduct, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    updateProduct.mutate(
      { id: product.id, payload: { stock: nextStock } },
      {
        onSuccess: () => setMessage(t("dashboard.myProducts.stockUpdated")),
        onError: () => setMessage(t("dashboard.myProducts.genericError")),
      },
    );
  };

  const renew = (product: MyProduct) => {
    renewProduct.mutate(product.id, {
      onSuccess: (renewed) =>
        setMessage(renewed?.expiresAt ? t("dashboard.myProducts.renewedUntil", { date: formatDate(renewed.expiresAt) }) : t("dashboard.myProducts.renewed")),
      onError: () => setMessage(t("dashboard.myProducts.genericError")),
    });
  };

  const boost = (product: MyProduct) => {
    if (!window.confirm(t("dashboard.myProducts.confirmBoost"))) return;
    boostProduct.mutate(product.id, {
      onSuccess: (updated) =>
        setMessage(updated?.featuredUntil ? t("dashboard.myProducts.boostedUntil", { date: formatDate(updated.featuredUntil) }) : t("dashboard.myProducts.boosted")),
      onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myProducts.genericError")),
    });
  };

  const markAsUrgent = (product: MyProduct) => {
    if (!window.confirm(t("dashboard.myProducts.confirmUrgent"))) return;
    markUrgent.mutate(product.id, {
      onSuccess: (updated) =>
        setMessage(updated?.urgentUntil ? t("dashboard.myProducts.urgentUntil", { date: formatDate(updated.urgentUntil) }) : t("dashboard.myProducts.urgentActivated")),
      onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myProducts.genericError")),
    });
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout
        title={t("dashboard.myProducts.title")}
        description={t("dashboard.myProducts.description")}
        actions={
          <Link to="/marketplace/deposer" className="btn-primary h-11 px-5 text-[14px]">
            <Plus size={17} /> {t("dashboard.myProducts.addProduct")}
          </Link>
        }
      >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={PackageCheck} label={t("dashboard.myProducts.statPublished")} value={String(publishedCount)} />
            <StatCard icon={Archive} label={t("dashboard.myProducts.statLowStock")} value={String(lowStockCount)} />
            <StatCard icon={Eye} label={t("dashboard.myProducts.statTotalViews")} value={String(totalViews)} />
          </div>

          <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("dashboard.myProducts.searchPlaceholder")}
                  className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "published", "review", "paused"] as const).map((status) => (
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
                    {status === "all" ? t("dashboard.myProducts.all") : statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
            {message && <p className="mt-3 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
              </div>
            ) : isError ? (
              <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                {t("dashboard.myProducts.loadError")}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
                <ShoppingBag className="mx-auto text-[var(--brand-primary)]" size={34} />
                <h2 className="mt-4 text-[20px] font-bold">{t("dashboard.myProducts.emptyTitle")}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.myProducts.emptyDesc")}</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const status = getStatus(product);
                return (
                  <article key={product.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{product.title}</h2>
                          <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[status]}`}>
                            {statusLabels[status]}
                          </span>
                          {isExpiringSoon(product.expiresAt) && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700">
                              {t("dashboard.myProducts.expiringSoon")}
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-gold)] bg-amber-50 px-3 py-1 text-[12px] font-bold text-[var(--brand-gold)]">
                              <Sparkles size={12} /> {t("dashboard.myProducts.featured")}
                            </span>
                          )}
                          {product.isUrgent && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-bold text-red-700">
                              <Flame size={12} /> {t("dashboard.myProducts.urgent")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                          {t("dashboard.myProducts.productSummary", {
                            category: product.category,
                            price: formatMoney(product.price),
                            stock: product.type !== "digital" ? t("dashboard.myProducts.stockSuffix", { count: product.stock }) : "",
                            updated: formatDate(product.updatedAt),
                            expires: product.expiresAt ? t("dashboard.myProducts.expiresSuffix", { date: formatDate(product.expiresAt) }) : "",
                          })}
                        </p>
                      </div>
                      <p className="text-[13px] font-bold text-[var(--color-text-secondary)]">{product.viewCount} {t("dashboard.myProducts.views")}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId((current) => (current === product.id ? null : product.id))}
                        className="btn-secondary h-10 px-4 text-[13px]"
                      >
                        <Pencil size={16} /> {t("dashboard.myProducts.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(product)}
                        disabled={updateProduct.isPending}
                        className="btn-secondary h-10 px-4 text-[13px]"
                      >
                        {product.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        {product.isActive ? t("dashboard.myProducts.pause") : t("dashboard.myProducts.publish")}
                      </button>
                      {product.type !== "digital" && (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustStock(product, 1)}
                            disabled={updateProduct.isPending}
                            className="btn-secondary h-10 px-4 text-[13px]"
                          >
                            {t("dashboard.myProducts.increaseStock")}
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock(product, -1)}
                            disabled={updateProduct.isPending}
                            className="btn-secondary h-10 px-4 text-[13px]"
                          >
                            {t("dashboard.myProducts.decreaseStock")}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => renew(product)}
                        disabled={renewProduct.isPending}
                        className="btn-secondary h-10 px-4 text-[13px]"
                      >
                        <RefreshCw size={16} /> {t("dashboard.myProducts.renew")}
                      </button>
                      {!product.isFeatured && (
                        <button
                          type="button"
                          onClick={() => boost(product)}
                          disabled={boostProduct.isPending}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-gold)] px-4 text-[13px] font-semibold text-[var(--brand-gold)]"
                        >
                          <Sparkles size={16} /> {t("dashboard.myProducts.boost")}
                        </button>
                      )}
                      {!product.isUrgent && (
                        <button
                          type="button"
                          onClick={() => markAsUrgent(product)}
                          disabled={markUrgent.isPending}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 px-4 text-[13px] font-semibold text-red-700"
                        >
                          <Flame size={16} /> {t("dashboard.myProducts.markUrgent")}
                        </button>
                      )}
                    </div>

                    {editingId === product.id && (
                      <ProductEditForm
                        product={product}
                        onClose={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          setMessage(t("dashboard.myProducts.updated"));
                        }}
                      />
                    )}
                  </article>
                );
              })
            )}
          </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function ProductEditForm({
  product,
  onClose,
  onSaved,
}: {
  product: MyProduct;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const updateProduct = useUpdateProduct();
  const uploadImages = useUploadProductImages();
  const taxonomyQuery = useTaxonomy("PRODUCT_CATEGORY");
  const allCategories = useMemo(() => taxonomyQuery.data ?? [], [taxonomyQuery.data]);
  const parentCategories = useMemo(() => allCategories.filter((item) => !item.parentId), [allCategories]);

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [images, setImages] = useState(product.images);
  const initialCategory = allCategories.find((item) => item.slug === product.categorySlug);
  const [parentCategoryId, setParentCategoryId] = useState(
    initialCategory?.parentId ?? initialCategory?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(initialCategory?.id ?? "");
  const subcategories = useMemo(
    () => allCategories.filter((item) => item.parentId === parentCategoryId),
    [allCategories, parentCategoryId],
  );
  const selectedCategory = allCategories.find((item) => item.id === categoryId) ?? allCategories.find((item) => item.id === parentCategoryId);
  const [error, setError] = useState("");

  const addPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadImages.mutate(
      { id: product.id, files: Array.from(files) },
      {
        onSuccess: (updated) => setImages(updated?.images ?? images),
        onError: (err) => setError(err instanceof Error ? err.message : t("dashboard.myProducts.genericError")),
      },
    );
  };

  const removePhoto = (url: string) => setImages((current) => current.filter((image) => image !== url));

  const save = () => {
    setError("");
    if (title.trim().length < 3) {
      setError(t("dashboard.myProducts.titleTooShort"));
      return;
    }
    if (description.trim().length < 10) {
      setError(t("dashboard.myProducts.descriptionTooShort"));
      return;
    }
    updateProduct.mutate(
      {
        id: product.id,
        payload: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          category: selectedCategory?.slug ?? product.categorySlug,
          stock: product.type !== "digital" ? Number(stock) || 0 : undefined,
          images,
        },
      },
      {
        onSuccess: () => onSaved(),
        onError: (err) => setError(err instanceof Error ? err.message : t("dashboard.myProducts.genericError")),
      },
    );
  };

  return (
    <div className="mt-4 space-y-3 rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
      <h3 className="text-[14px] font-bold text-[var(--color-text-primary)]">{t("dashboard.myProducts.editTitle")}</h3>

      <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
        {t("dashboard.myProducts.fieldTitle")}
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 h-10 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
        />
      </label>

      <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
        {t("dashboard.myProducts.fieldDescription")}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 py-2 text-[14px] outline-none focus:border-[var(--brand-primary)]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
          {t("dashboard.myProducts.fieldPrice")}
          <input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 h-10 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
          />
        </label>
        {product.type !== "digital" && (
          <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
            {t("dashboard.myProducts.fieldStock")}
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="mt-1 h-10 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
            />
          </label>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
          {t("dashboard.myProducts.fieldCategory")}
          <select
            value={parentCategoryId}
            onChange={(event) => {
              setParentCategoryId(event.target.value);
              setCategoryId(event.target.value);
            }}
            className="mt-1 h-10 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
          >
            {parentCategories.map((parent) => (
              <option key={parent.id} value={parent.id}>{parent.name}</option>
            ))}
          </select>
        </label>
        {subcategories.length > 0 && (
          <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)]">
            {t("dashboard.myProducts.fieldSubcategory")}
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-1 h-10 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
            >
              {subcategories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div>
        <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{t("dashboard.myProducts.fieldImages")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-[8px] border border-[var(--brand-border-light)]">
              <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label={t("dashboard.myProducts.removePhoto")}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-[8px] border border-dashed border-[var(--brand-border)] text-[var(--color-text-muted)] hover:border-[var(--brand-primary)]">
            <Plus size={18} />
            <input type="file" accept="image/*" multiple hidden onChange={(event) => addPhotos(event.target.files)} />
          </label>
        </div>
        {uploadImages.isPending && <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{t("dashboard.myProducts.uploadingPhotos")}</p>}
      </div>

      {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={updateProduct.isPending}
          className="btn-primary h-10 px-5 text-[13px]"
        >
          {updateProduct.isPending ? t("dashboard.myProducts.saving") : t("dashboard.myProducts.save")}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary h-10 px-5 text-[13px]">
          {t("dashboard.myProducts.cancel")}
        </button>
      </div>
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

export const Route = createFileRoute("/tableau-de-bord/mes-produits")({
  head: () => ({ meta: [{ title: "Mes produits - IWOSAN" }] }),
  component: MesProduitsPage,
});
