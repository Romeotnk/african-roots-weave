import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Archive, Copy, Eye, PackageCheck, Plus, Search, ShoppingBag, ToggleLeft, ToggleRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

type ProductStatus = "published" | "draft" | "review" | "paused";

type Product = {
  id: string;
  title: string;
  type: string;
  price: number;
  stock: number;
  views: number;
  status: ProductStatus;
  updatedAt: string;
};

const initialProducts: Product[] = [
  { id: "p-1", title: "Huile de nigelle bio", type: "Produit physique", price: 18500, stock: 28, views: 421, status: "published", updatedAt: "08/07/2026" },
  { id: "p-2", title: "Pack tisane detox", type: "Produit physique", price: 12500, stock: 8, views: 189, status: "review", updatedAt: "06/07/2026" },
  { id: "p-3", title: "Guide plantes post-partum", type: "Document numerique", price: 9000, stock: 999, views: 96, status: "draft", updatedAt: "02/07/2026" },
];

const statusLabels: Record<ProductStatus, string> = {
  published: "Publie",
  draft: "Brouillon",
  review: "En validation",
  paused: "Pause",
};

const statusClasses: Record<ProductStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  review: "bg-amber-50 text-amber-700 border-amber-100",
  paused: "bg-red-50 text-red-700 border-red-100",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function MesProduitsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.title, product.type].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [products, query, statusFilter]);

  const publishedCount = products.filter((product) => product.status === "published").length;
  const lowStockCount = products.filter((product) => product.stock <= 10 && product.stock < 999).length;
  const totalViews = products.reduce((sum, product) => sum + product.views, 0);

  const setStatus = (id: string, status: ProductStatus) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, status } : product)));
    setMessage(`Produit ${statusLabels[status].toLowerCase()} avec succes.`);
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, stock: Math.max(0, product.stock + delta) } : product)),
    );
    setMessage("Stock mis a jour.");
  };

  const duplicateProduct = (product: Product) => {
    setProducts((current) => [
      { ...product, id: `p-${Date.now()}`, title: `${product.title} - copie`, status: "draft", views: 0, updatedAt: new Date().toLocaleDateString("fr-FR") },
      ...current,
    ]);
    setMessage("Produit duplique en brouillon.");
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
                <h1 className="mt-2 text-[32px] md:text-[42px]">Mes produits</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Suivez vos produits, leur statut de publication, leur prix et leur stock.
                </p>
              </div>
              <Link to="/marketplace/deposer" className="btn-primary h-11 px-5 text-[14px]">
                <Plus size={17} /> Ajouter un produit
              </Link>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
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
                {(["all", "published", "review", "draft", "paused"] as const).map((status) => (
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
            {filteredProducts.length === 0 ? (
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
                <ShoppingBag className="mx-auto text-[var(--brand-primary)]" size={34} />
                <h2 className="mt-4 text-[20px] font-bold">Aucun produit trouve</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez une autre recherche ou ajoutez votre premier produit.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <article key={product.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{product.title}</h2>
                        <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[product.status]}`}>
                          {statusLabels[product.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        {product.type} - {formatMoney(product.price)} - stock {product.stock} - maj {product.updatedAt}
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-[var(--color-text-secondary)]">{product.views} vues</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setStatus(product.id, product.status === "published" ? "paused" : "published")} className="btn-secondary h-10 px-4 text-[13px]">
                      {product.status === "published" ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      {product.status === "published" ? "Mettre en pause" : "Publier"}
                    </button>
                    <button type="button" onClick={() => adjustStock(product.id, 1)} className="btn-secondary h-10 px-4 text-[13px]">+ Stock</button>
                    <button type="button" onClick={() => adjustStock(product.id, -1)} className="btn-secondary h-10 px-4 text-[13px]">- Stock</button>
                    <button type="button" onClick={() => duplicateProduct(product)} className="btn-secondary h-10 px-4 text-[13px]">
                      <Copy size={16} /> Dupliquer
                    </button>
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

export const Route = createFileRoute("/tableau-de-bord/mes-produits")({
  head: () => ({ meta: [{ title: "Mes produits - IWOSAN" }] }),
  component: MesProduitsPage,
});