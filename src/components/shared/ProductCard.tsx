import type { Product } from "@/types";
import { Badge } from "./Badge";
import { RatingStars } from "./RatingStars";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group bg-white rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover flex flex-col">
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="category">{product.category.split(" ")[0]}</Badge>
        </div>
        {product.auction && (
          <div className="absolute top-3 right-3">
            <Badge variant="gold">Enchère</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <img src={product.sellerAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-[12px] text-[var(--color-text-muted)]">{product.sellerName}</span>
        </div>
        <h3 className="text-[16px] font-semibold leading-snug line-clamp-2 mb-2">
          {product.title}
        </h3>
        <div className="text-[18px] font-bold text-[var(--brand-primary)] mb-2">
          {product.price.toLocaleString("fr-FR")} {product.currency}
        </div>
        <div className="mb-3">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <div className="mt-auto flex gap-2">
          <button className="flex-1 h-9 rounded-md border border-[var(--brand-border)] text-[13px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition">
            Voir
          </button>
          <button className="flex-1 h-9 rounded-md bg-[var(--brand-primary)] text-white text-[13px] font-semibold hover:bg-[var(--brand-primary-dark)] transition">
            Contacter
          </button>
        </div>
      </div>
    </article>
  );
}
