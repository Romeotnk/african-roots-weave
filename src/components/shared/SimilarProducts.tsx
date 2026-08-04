import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useApiCatalog";

export function SimilarProducts({ category, excludeId }: { category: string; excludeId: string }) {
  const query = useMemo(() => new URLSearchParams({ category, limit: "5" }), [category]);
  const { data } = useProducts(query);
  const items = (data?.products ?? []).filter((product) => product.id !== excludeId).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border p-4 sm:p-5">
      <p className="font-mono text-[12px] text-[var(--brand-primary)]">Annonces similaires</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((product) => (
          <Link
            key={product.id}
            to="/marketplace"
            search={{ produit: product.id } as never}
            className="flex gap-3 rounded-xl border border-[var(--brand-border-light)] p-2 hover:border-[var(--brand-primary)]"
          >
            <img src={product.image} alt={product.title} loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] font-semibold">{product.title}</p>
              <p className="mt-1 text-[12px] font-bold text-[var(--brand-primary)]">
                {product.price.toLocaleString("fr-FR")} {product.currency}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
