import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Copy, MapPin, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { RatingStars } from "./RatingStars";
import { Badge } from "./Badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const price = product.price;
  const originalPrice = (product as Product & { originalPrice?: number }).originalPrice;
  const discountPercent = (product as Product & { discountPercent?: number }).discountPercent;
  const sellerId = (product as Product & { sellerProfileId?: string }).sellerProfileId ?? product.sellerId;
  const hasPromo = Boolean(originalPrice && originalPrice > price) || Boolean(discountPercent);
  const productCode = `IWO-${product.id.replace(/\D/g, "").padStart(3, "0") || "001"}`;

  const message = useMemo(() => `Bonjour, je suis intéressé(e) par votre produit : ${product.title}. Pouvez-vous me donner plus d'informations ?`, [product.title]);
  const sellerProfileUrl = `/pro/${sellerId}`;
  const reservationUrl = `${sellerProfileUrl}?message=${encodeURIComponent(message)}&product=${encodeURIComponent(product.title)}`;

  return (
    <>
      <article className="group overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-iwosan-lg">
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative h-[240px] overflow-hidden">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_bottom,transparent_40%,#1f5a39_100%)]" />
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge variant="category">{product.category}</Badge>
              {product.verified && <Badge variant="gold">Vérifié</Badge>}
            </div>
            {hasPromo && discountPercent && (
              <div className="absolute right-3 top-3 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-[11px] font-bold text-white">-{discountPercent}%</div>
            )}
          </div>
        </button>
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
            <img src={product.sellerAvatar} alt={product.sellerName} className="h-6 w-6 rounded-full object-cover" />
            <span>{product.sellerName}</span>
            {product.verified && <ShieldCheck size={13} className="text-[var(--brand-gold)]" />}
          </div>
          <h3 className="text-[18px] font-bold leading-tight text-[var(--color-text-primary)] line-clamp-2">{product.title}</h3>
          {product.location && <p className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-muted)]"><MapPin size={14} />{product.location}{product.country ? `, ${product.country}` : ""}</p>}
          <div className="flex items-baseline gap-2">
            {originalPrice && originalPrice > price && <span className="text-[13px] text-[var(--color-text-muted)] line-through">{originalPrice.toLocaleString("fr-FR")} {product.currency}</span>}
            <span className="text-[22px] font-bold text-[var(--brand-primary)]">{price.toLocaleString("fr-FR")} {product.currency}</span>
          </div>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="button" onClick={() => setOpen(true)} className="flex-1 rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">Voir</button>
            <a href={reservationUrl} className="flex-1 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-center text-[13px] font-semibold text-white">Réserver ce produit</a>
          </div>
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-3xl max-h-[90vh] overflow-hidden rounded-[28px] p-0 sm:w-[calc(100vw-2rem)] sm:max-w-3xl">
          <div className="flex max-h-[90vh] flex-col overflow-hidden">
          <div className="relative h-[260px] shrink-0 sm:h-[300px]">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent_35%,rgba(31,90,57,.95)_100%)]" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge variant="category">{product.category}</Badge>
              {hasPromo && <Badge variant="gold">Promo</Badge>}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[12px] text-white">{productCode}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto space-y-5 p-5 sm:p-7">
            <DialogHeader>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">{product.category}</p>
              <DialogTitle className="text-[24px] font-semibold sm:text-[30px]">{product.title}</DialogTitle>
              <DialogDescription>Produit détaillé et réservation directe auprès du vendeur.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border p-4">
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Prix</p>
                <p className="mt-1 text-[18px] font-bold">{price.toLocaleString("fr-FR")} {product.currency}</p>
              </div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Type</p><p className="mt-1 text-[18px] font-bold">{product.type}</p></div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Stock</p><p className="mt-1 text-[18px] font-bold">Disponible</p></div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Localisation</p><p className="mt-1 text-[18px] font-bold">{product.location ?? "Afrique"}</p></div>
            </div>
            <div className="rounded-2xl border p-4 sm:p-5">
              <p className="font-mono text-[12px] text-[var(--brand-terracotta)]">Vendeur</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <img src={product.sellerAvatar} alt={product.sellerName} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/pro/$id" params={{ id: sellerId }} className="inline-flex items-center gap-1 text-[15px] font-bold text-[var(--brand-primary)]">{product.sellerName} <BadgeCheck size={14} /></Link>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">Fiche officielle du professionnel avec réservation directe.</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                <span>({product.reviewCount} avis)</span>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border p-4 sm:p-5">
              <p className="font-mono text-[12px] text-[var(--brand-primary)]">Description</p>
              <p className="text-[14px] leading-7 text-[var(--color-text-secondary)]">{product.description ?? product.title}</p>
            </div>
            <div className="grid gap-3 rounded-2xl border p-4 sm:p-5">
              <div>
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Posologie</p>
                <p className="mt-1 text-[14px] leading-7 text-[var(--color-text-secondary)]">{product.dosage ?? "À définir avec le vendeur selon l'usage et le profil de l'acheteur."}</p>
              </div>
              <div>
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Composition</p>
                <p className="mt-1 text-[14px] leading-7 text-[var(--color-text-secondary)]">{product.composition ?? "Composition détaillée disponible auprès du vendeur ou dans la conversation pré-remplie."}</p>
              </div>
              <div>
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Mode de préparation</p>
                <p className="mt-1 text-[14px] leading-7 text-[var(--color-text-secondary)]">{product.preparation ?? "Préparation, usage et conservation communiqués directement par le praticien."}</p>
              </div>
              <div>
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Contre-indications</p>
                <p className="mt-1 text-[14px] leading-7 text-[var(--color-text-secondary)]">{product.contraindications ?? "Demander confirmation au vendeur avant toute utilisation, surtout en cas de grossesse, allaitement ou traitement en cours."}</p>
              </div>
            </div>
            <div className="rounded-2xl border p-4 sm:p-5">
              <p className="font-mono text-[12px] text-[var(--brand-primary)]">Vendeur</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <img src={product.sellerAvatar} alt={product.sellerName} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/pro/$id" params={{ id: sellerId }} className="inline-flex items-center gap-1 text-[15px] font-bold text-[var(--brand-primary)]">{product.sellerName} <BadgeCheck size={14} /></Link>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">Profil officiel du professionnel, informations et prise de contact.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={reservationUrl} className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">Réserver ce produit</a>
              <a href={sellerProfileUrl} className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--brand-border)] px-5 font-semibold">Voir le profil vendeur</a>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}





