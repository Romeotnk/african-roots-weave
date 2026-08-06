import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Archive, Eye, Flame, Loader2, PackageCheck, Plus, RefreshCw, Search, ShoppingBag, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useBoostProduct, useMarkProductUrgent, useMyProducts, useRenewProduct, useUpdateProduct } from "@/hooks/useApiCatalog";
import type { MyProduct } from "@/lib/api/catalog";

type DisplayStatus = "published" | "review" | "paused";

const statusLabels: Record<DisplayStatus, string> = {
  published: "Publie",
  review: "En validation",
  paused: "Pause",
};

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
  const { data: products, isLoading, isError } = useMyProducts();
  const updateProduct = useUpdateProduct();
  const renewProduct = useRenewProduct();
  const boostProduct = useBoostProduct();
  const markUrgent = useMarkProductUrgent();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [message, setMessage] = useState("");

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
        onSuccess: () => setMessage(product.isActive ? "Annonce mise en pause." : "Annonce publiee."),
        onError: () => setMessage("Une erreur est survenue, reessayez."),
      },
    );
  };

  const adjustStock = (product: MyProduct, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    updateProduct.mutate(
      { id: product.id, payload: { stock: nextStock } },
      {
        onSuccess: () => setMessage("Stock mis a jour."),
        onError: () => setMessage("Une erreur est survenue, reessayez."),
      },
    );
  };

  const renew = (product: MyProduct) => {
    renewProduct.mutate(product.id, {
      onSuccess: (renewed) =>
        setMessage(renewed?.expiresAt ? `Annonce renouvelee jusqu'au ${formatDate(renewed.expiresAt)}.` : "Annonce renouvelee."),
      onError: () => setMessage("Une erreur est survenue, reessayez."),
    });
  };

  const boost = (product: MyProduct) => {
    if (!window.confirm("Mettre cette annonce en avant pour 7 jours (2 000 FCFA preleves sur votre portefeuille) ?")) return;
    boostProduct.mutate(product.id, {
      onSuccess: (updated) =>
        setMessage(updated?.featuredUntil ? `Annonce mise en avant jusqu'au ${formatDate(updated.featuredUntil)}.` : "Annonce mise en avant."),
      onError: (error) => setMessage(error instanceof Error ? error.message : "Une erreur est survenue, reessayez."),
    });
  };

  const markAsUrgent = (product: MyProduct) => {
    if (!window.confirm("Ajouter le badge urgent pour 3 jours (1 000 FCFA preleves sur votre portefeuille) ?")) return;
    markUrgent.mutate(product.id, {
      onSuccess: (updated) =>
        setMessage(updated?.urgentUntil ? `Badge urgent actif jusqu'au ${formatDate(updated.urgentUntil)}.` : "Badge urgent active."),
      onError: (error) => setMessage(error instanceof Error ? error.message : "Une erreur est survenue, reessayez."),
    });
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <AccountLayout
        title="Mes produits"
        description="Suivez vos produits, leur statut de publication, leur prix et leur stock."
        actions={
          <Link to="/marketplace/deposer" className="btn-primary h-11 px-5 text-[14px]">
            <Plus size={17} /> Ajouter un produit
          </Link>
        }
      >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={PackageCheck} label="Publies" value={String(publishedCount)} />
            <StatCard icon={Archive} label="Stock faible" value={String(lowStockCount)} />
            <StatCard icon={Eye} label="Vues totales" value={String(totalViews)} />
          </div>

          <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un produit"
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
                    {status === "all" ? "Tous" : statusLabels[status]}
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
                Impossible de charger vos produits pour le moment.
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
                <ShoppingBag className="mx-auto text-[var(--brand-primary)]" size={34} />
                <h2 className="mt-4 text-[20px] font-bold">Aucun produit trouve</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez une autre recherche ou ajoutez votre premier produit.</p>
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
                              Expire bientot
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-gold)] bg-amber-50 px-3 py-1 text-[12px] font-bold text-[var(--brand-gold)]">
                              <Sparkles size={12} /> En avant
                            </span>
                          )}
                          {product.isUrgent && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-bold text-red-700">
                              <Flame size={12} /> Urgent
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                          {product.category} - {formatMoney(product.price)}
                          {product.type !== "digital" ? ` - stock ${product.stock}` : ""} - maj {formatDate(product.updatedAt)}
                          {product.expiresAt ? ` - expire le ${formatDate(product.expiresAt)}` : ""}
                        </p>
                      </div>
                      <p className="text-[13px] font-bold text-[var(--color-text-secondary)]">{product.viewCount} vues</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublish(product)}
                        disabled={updateProduct.isPending}
                        className="btn-secondary h-10 px-4 text-[13px]"
                      >
                        {product.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        {product.isActive ? "Mettre en pause" : "Publier"}
                      </button>
                      {product.type !== "digital" && (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustStock(product, 1)}
                            disabled={updateProduct.isPending}
                            className="btn-secondary h-10 px-4 text-[13px]"
                          >
                            + Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock(product, -1)}
                            disabled={updateProduct.isPending}
                            className="btn-secondary h-10 px-4 text-[13px]"
                          >
                            - Stock
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => renew(product)}
                        disabled={renewProduct.isPending}
                        className="btn-secondary h-10 px-4 text-[13px]"
                      >
                        <RefreshCw size={16} /> Renouveler
                      </button>
                      {!product.isFeatured && (
                        <button
                          type="button"
                          onClick={() => boost(product)}
                          disabled={boostProduct.isPending}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-gold)] px-4 text-[13px] font-semibold text-[var(--brand-gold)]"
                        >
                          <Sparkles size={16} /> Mettre en avant (2 000 FCFA)
                        </button>
                      )}
                      {!product.isUrgent && (
                        <button
                          type="button"
                          onClick={() => markAsUrgent(product)}
                          disabled={markUrgent.isPending}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 px-4 text-[13px] font-semibold text-red-700"
                        >
                          <Flame size={16} /> Badge urgent (1 000 FCFA)
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
      </AccountLayout>
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

export const Route = createFileRoute("/tableau-de-bord/mes-produits")({
  head: () => ({ meta: [{ title: "Mes produits - IWOSAN" }] }),
  component: MesProduitsPage,
});
