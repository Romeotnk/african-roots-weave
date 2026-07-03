import type { Product } from "@/types";
import { Badge } from "./Badge";
import { RatingStars } from "./RatingStars";
import { Copy, Facebook, MapPin, MessageCircle, ShieldCheck, Twitter } from "lucide-react";
import { useCart } from "@/cart/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  return (
    <article className="group bg-[var(--color-surface)] rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover flex flex-col">
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
        {product.urgent && (
          <div className="absolute bottom-3 left-3 rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
            URGENT
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <img src={product.sellerAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-[12px] text-[var(--color-text-muted)]">{product.sellerName}</span>
          {product.verified && <ShieldCheck size={13} className="text-[var(--brand-primary)]" />}
        </div>
        <h3 className="text-[16px] font-semibold leading-snug line-clamp-2 mb-2">
          {product.title}
        </h3>
        {product.location && (
          <p className="mb-2 inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
            <MapPin size={13} /> {product.location}
            {product.country ? `, ${product.country}` : ""}
          </p>
        )}
        <div className="text-[18px] font-bold text-[var(--brand-primary)] mb-2">
          {product.price.toLocaleString("fr-FR")} {product.currency}
        </div>
        <div className="mb-3">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <div className="mb-3 flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
          {[MessageCircle, Facebook, Twitter, Copy].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="grid h-7 w-7 place-items-center rounded-full border border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              aria-label="Partager"
            >
              <Icon size={13} />
            </button>
          ))}
          <span className="ml-1">{product.shareCount ?? 0} partages</span>
        </div>
        <div className="mt-auto flex gap-2">
          <button className="flex-1 h-9 rounded-md border border-[var(--brand-border)] text-[13px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition">
            Voir
          </button>
          <button
            onClick={() => addItem(product)}
            className="flex-1 h-9 rounded-md bg-[var(--brand-primary)] text-white text-[13px] font-semibold hover:bg-[var(--brand-primary-dark)] transition"
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}
