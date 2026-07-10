import { useState } from "react";
import type { Product } from "@/types";
import { Badge } from "./Badge";
import { RatingStars } from "./RatingStars";
import { Copy, Facebook, MapPin, MessageCircle, ShieldCheck, Twitter } from "lucide-react";
import { useCart } from "@/cart/CartContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const productUrl =
    typeof window === "undefined"
      ? `/marketplace?produit=${product.id}`
      : `${window.location.origin}/marketplace?produit=${product.id}`;

  const shareProduct = async (channel: "contact" | "facebook" | "twitter" | "copy") => {
    if (channel === "contact") {
      setShareMessage(`Contact vendeur : ${product.sellerName}`);
      return;
    }

    if (channel === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank", "noopener,noreferrer");
      setShareMessage("Fenetre de partage Facebook ouverte.");
      return;
    }

    if (channel === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}&url=${encodeURIComponent(productUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setShareMessage("Fenetre de partage X ouverte.");
      return;
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setShareMessage("Lien copie dans le presse-papiers.");
    } catch {
      setShareMessage(productUrl);
    }
  };

  return (
    <>
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
              <Badge variant="gold">Enchere</Badge>
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
            {[
              { icon: MessageCircle, label: "Contacter le vendeur", channel: "contact" as const },
              { icon: Facebook, label: "Partager sur Facebook", channel: "facebook" as const },
              { icon: Twitter, label: "Partager sur X", channel: "twitter" as const },
              { icon: Copy, label: "Copier le lien", channel: "copy" as const },
            ].map(({ icon: Icon, label, channel }) => (
              <button
                key={channel}
                type="button"
                onClick={() => void shareProduct(channel)}
                className="grid h-7 w-7 place-items-center rounded-full border border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                aria-label={label}
                title={label}
              >
                <Icon size={13} />
              </button>
            ))}
            <span className="ml-1">{product.shareCount ?? 0} partages</span>
          </div>
          {shareMessage && <p className="mb-3 text-[11px] font-semibold text-[var(--brand-primary)]">{shareMessage}</p>}
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex-1 h-9 rounded-md border border-[var(--brand-border)] text-[13px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition"
            >
              Voir
            </button>
            <button
              type="button"
              onClick={() => addItem(product)}
              className="flex-1 h-9 rounded-md bg-[var(--brand-primary)] text-white text-[13px] font-semibold hover:bg-[var(--brand-primary-dark)] transition"
            >
              Ajouter
            </button>
          </div>
        </div>
      </article>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.title}</DialogTitle>
            <DialogDescription>
              Apercu rapide du produit avant l'ajout au panier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <img src={product.image} alt={product.title} className="h-56 w-full rounded-lg object-cover" />
            <div className="space-y-3 text-[14px]">
              <p className="font-semibold text-[var(--brand-primary)]">
                {product.price.toLocaleString("fr-FR")} {product.currency}
              </p>
              <p>Vendeur : {product.sellerName}</p>
              {product.location && <p>Lieu : {product.location}{product.country ? `, ${product.country}` : ""}</p>}
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
              <button
                type="button"
                onClick={() => {
                  addItem(product);
                  setPreviewOpen(false);
                }}
                className="h-10 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}