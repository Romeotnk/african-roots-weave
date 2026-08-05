import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Copy, Eye, Flag, Gavel, MapPin, Share2, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { useProductBids, usePlaceProductBid } from "@/hooks/useApiCatalog";
import { useCreateQuoteRequest } from "@/hooks/useQuotesApi";
import { useForumReport } from "@/hooks/useForumApi";
import type { ReportReasonCategory } from "@/lib/api/forum";
import { RatingStars } from "./RatingStars";
import { Badge } from "./Badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BuyProductPanel } from "./BuyProductPanel";
import { SimilarProducts } from "./SimilarProducts";

const REPORT_REASON_OPTIONS: { value: ReportReasonCategory; label: string }[] = [
  { value: "FRAUDULENT_CONTENT", label: "Contenu frauduleux" },
  { value: "PROHIBITED_ITEM", label: "Produit interdit" },
  { value: "SCAM", label: "Arnaque / escroquerie" },
  { value: "INAPPROPRIATE_CONTENT", label: "Contenu inapproprié" },
  { value: "SPAM", label: "Spam" },
  { value: "OTHER", label: "Autre" },
];

type ProductBid = { id: string; amount: number | string; bidder?: { firstName: string; lastName: string } };

function AuctionBidPanel({ productId, basePrice }: { productId: string; basePrice: number }) {
  const bidsQuery = useProductBids(productId);
  const placeBid = usePlaceProductBid();
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState("");

  const bids = (bidsQuery.data ?? []) as ProductBid[];
  const topBid = bids[0] ? Number(bids[0].amount) : basePrice;

  const submitBid = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback("");
    const value = Number(amount);
    if (!value || value <= topBid) {
      setFeedback(`Votre offre doit dépasser ${topBid.toLocaleString("fr-FR")} FCFA.`);
      return;
    }
    placeBid.mutate(
      { id: productId, amount: value },
      {
        onSuccess: () => { setAmount(""); setFeedback("Offre enregistrée."); },
        onError: (error) => setFeedback(error instanceof Error ? error.message : "Impossible d'enregistrer l'offre."),
      },
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border p-4 sm:p-5">
      <p className="flex items-center gap-2 font-mono text-[12px] text-[var(--brand-primary)]"><Gavel size={14} /> Enchère en cours</p>
      <p className="text-[18px] font-bold">{topBid.toLocaleString("fr-FR")} FCFA {bids.length > 0 ? "(offre la plus haute)" : "(prix de départ)"}</p>
      {bids.length > 0 && bids[0].bidder && (
        <p className="text-[13px] text-[var(--color-text-muted)]">Par {bids[0].bidder.firstName} {bids[0].bidder.lastName.slice(0, 1)}.</p>
      )}
      <form onSubmit={submitBid} className="flex flex-wrap gap-2">
        <input
          type="number"
          min={topBid + 1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder={`Plus de ${topBid.toLocaleString("fr-FR")} FCFA`}
          className="h-11 flex-1 rounded-lg border border-[var(--brand-border)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
        />
        <button type="submit" disabled={placeBid.isPending} className="h-11 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-60">
          {placeBid.isPending ? "Envoi..." : "Enchérir"}
        </button>
      </form>
      {feedback && <p className="text-[13px] text-[var(--color-text-secondary)]">{feedback}</p>}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [quoteNotice, setQuoteNotice] = useState("");
  const createQuoteRequest = useCreateQuoteRequest();
  const reportMutation = useForumReport();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReasonCategory, setReportReasonCategory] = useState<ReportReasonCategory | "">("");
  const [reportDetail, setReportDetail] = useState("");
  const [reportNotice, setReportNotice] = useState("");
  const price = product.price;
  const categoryLabel = product.categoryLabel ?? product.category;
  const originalPrice = (product as Product & { originalPrice?: number }).originalPrice;
  const discountPercent = (product as Product & { discountPercent?: number }).discountPercent;
  const sellerId = (product as Product & { sellerProfileId?: string }).sellerProfileId ?? product.sellerId;
  const hasPromo = Boolean(originalPrice && originalPrice > price) || Boolean(discountPercent);
  const productCode = `IWO-${product.id.replace(/\D/g, "").padStart(3, "0") || "001"}`;
  const outOfStock = product.type !== "digital" && product.stock !== undefined && product.stock <= 0;

  const message = useMemo(() => `Bonjour, je suis intéressé(e) par votre produit : ${product.title}. Pouvez-vous me donner plus d'informations ?`, [product.title]);
  const sellerProfileUrl = `/pro/${sellerId}`;
  const reservationUrl = `${sellerProfileUrl}?message=${encodeURIComponent(message)}&product=${encodeURIComponent(product.title)}`;

  const shareProduct = (label: "WhatsApp" | "Facebook" | "Copier") => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/marketplace?produit=${product.id}` : "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(product.title);
    if (label === "Copier") {
      navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
      setShareNotice("Lien copié.");
      return;
    }
    const target =
      label === "WhatsApp"
        ? `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setShareNotice(`Ouverture du partage ${label}.`);
  };

  const submitReport = () => {
    if (!reportReasonCategory) {
      setReportNotice("Choisissez un motif de signalement.");
      return;
    }
    reportMutation.mutate(
      { targetId: product.id, targetType: "PRODUCT", reasonCategory: reportReasonCategory, reason: reportDetail.trim() },
      {
        onSuccess: () => {
          setReportNotice("Signalement transmis à l'équipe de modération. Merci.");
          setReportReasonCategory("");
          setReportDetail("");
        },
        onError: (error) => setReportNotice(error instanceof Error ? error.message : "Connectez-vous pour signaler cette annonce."),
      },
    );
  };

  const requestQuote = () => {
    setQuoteNotice("");
    createQuoteRequest.mutate(
      { productId: product.id },
      {
        onSuccess: () => setQuoteNotice("Demande de devis envoyée au vendeur."),
        onError: (error) => setQuoteNotice(error instanceof Error ? error.message : "Connectez-vous pour demander un devis."),
      },
    );
  };

  return (
    <>
      <article className="group overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-iwosan-lg">
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative h-[240px] overflow-hidden">
            <img src={product.image} alt={product.title} loading="lazy" decoding="async" width={400} height={240} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_bottom,transparent_40%,#1f5a39_100%)]" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="category">{categoryLabel}</Badge>
              {product.verified && <Badge variant="gold">Vérifié</Badge>}
              {product.urgent && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Urgent</span>}
            </div>
            {hasPromo && discountPercent && (
              <div className="absolute right-3 top-3 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-[11px] font-bold text-white">-{discountPercent}%</div>
            )}
            {outOfStock && (
              <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">Rupture de stock</div>
            )}
          </div>
        </button>
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
            <img src={product.sellerAvatar} alt={product.sellerName} loading="lazy" decoding="async" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
            <span>{product.sellerName}</span>
            {product.verified && <ShieldCheck size={13} className="text-[var(--brand-gold)]" />}
          </div>
          <h3 className="text-[18px] font-bold leading-tight text-[var(--color-text-primary)] line-clamp-2">{product.title}</h3>
          {product.location && <p className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-muted)]"><MapPin size={14} />{product.location}{product.country ? `, ${product.country}` : ""}</p>}
          <div className="flex items-baseline gap-2">
            {product.quoteOnly ? (
              <span className="text-[18px] font-bold text-[var(--brand-primary)]">Prix sur devis</span>
            ) : (
              <>
                {originalPrice && originalPrice > price && <span className="text-[13px] text-[var(--color-text-muted)] line-through">{originalPrice.toLocaleString("fr-FR")} {product.currency}</span>}
                <span className="text-[22px] font-bold text-[var(--brand-primary)]">{price.toLocaleString("fr-FR")} {product.currency}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            {typeof product.viewCount === "number" && product.viewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                <Eye size={12} /> {product.viewCount}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="button" onClick={() => setOpen(true)} className="flex-1 rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">Voir</button>
            {product.quoteOnly ? (
              <button type="button" onClick={requestQuote} disabled={createQuoteRequest.isPending} className="flex-1 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-center text-[13px] font-semibold text-white disabled:opacity-60">
                Demander un devis
              </button>
            ) : outOfStock ? (
              <span className="flex-1 rounded-full bg-[var(--brand-border-light)] px-4 py-2 text-center text-[13px] font-semibold text-[var(--color-text-muted)]">Indisponible</span>
            ) : (
              <a href={reservationUrl} className="flex-1 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-center text-[13px] font-semibold text-white">Réserver ce produit</a>
            )}
          </div>
          {quoteNotice && <p className="text-[12px] font-semibold text-[var(--brand-primary)]">{quoteNotice}</p>}
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-3xl max-h-[90vh] overflow-hidden rounded-[28px] p-0 sm:w-[calc(100vw-2rem)] sm:max-w-3xl">
          <div className="flex max-h-[90vh] flex-col overflow-hidden">
          <div className="relative h-[260px] shrink-0 sm:h-[300px]">
            <img src={product.image} alt={product.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent_35%,rgba(31,90,57,.95)_100%)]" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge variant="category">{categoryLabel}</Badge>
              {hasPromo && <Badge variant="gold">Promo</Badge>}
              {product.urgent && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Urgent</span>}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[12px] text-white">{productCode}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto space-y-5 p-5 sm:p-7">
            <DialogHeader>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">{categoryLabel}</p>
              <DialogTitle className="text-[24px] font-semibold sm:text-[30px]">{product.title}</DialogTitle>
              <DialogDescription>Produit détaillé et réservation directe auprès du vendeur.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border p-4">
                <p className="font-mono text-[12px] text-[var(--brand-primary)]">Prix</p>
                <p className="mt-1 text-[18px] font-bold">{product.quoteOnly ? "Sur devis" : `${price.toLocaleString("fr-FR")} ${product.currency}`}</p>
              </div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Type</p><p className="mt-1 text-[18px] font-bold">{product.type}</p></div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Stock</p><p className={`mt-1 text-[18px] font-bold ${outOfStock ? "text-red-600" : ""}`}>{product.type === "digital" ? "Illimité" : outOfStock ? "Rupture de stock" : `${product.stock ?? "Disponible"}${typeof product.stock === "number" ? " en stock" : ""}`}</p></div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Localisation</p><p className="mt-1 text-[18px] font-bold">{product.location ?? "Afrique"}</p></div>
              <div className="rounded-2xl border p-4"><p className="font-mono text-[12px] text-[var(--brand-primary)]">Vues</p><p className="mt-1 text-[18px] font-bold">{product.viewCount ?? 0}</p></div>
            </div>
            {product.auction && open && <AuctionBidPanel productId={product.id} basePrice={price} />}
            {!product.auction && !product.quoteOnly && product.type !== "service" && !outOfStock && open && (
              <BuyProductPanel productId={product.id} maxQuantity={product.stock} isDigital={product.type === "digital"} />
            )}
            <div className="rounded-2xl border p-4 sm:p-5">
              <p className="font-mono text-[12px] text-[var(--brand-terracotta)]">Vendeur</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <img src={product.sellerAvatar} alt={product.sellerName} loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
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
            {open && <SimilarProducts category={product.category} excludeId={product.id} />}
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
                <img src={product.sellerAvatar} alt={product.sellerName} loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/pro/$id" params={{ id: sellerId }} className="inline-flex items-center gap-1 text-[15px] font-bold text-[var(--brand-primary)]">{product.sellerName} <BadgeCheck size={14} /></Link>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">Profil officiel du professionnel, informations et prise de contact.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {product.quoteOnly ? (
                <button type="button" onClick={requestQuote} disabled={createQuoteRequest.isPending} className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white disabled:opacity-60">
                  Demander un devis
                </button>
              ) : outOfStock ? (
                <span className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--brand-border-light)] px-5 font-semibold text-[var(--color-text-muted)]">Indisponible (rupture de stock)</span>
              ) : (
                <a href={reservationUrl} className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">Réserver ce produit</a>
              )}
              <a href={sellerProfileUrl} className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--brand-border)] px-5 font-semibold">Voir le profil vendeur</a>
            </div>
            {quoteNotice && <p className="text-[13px] font-semibold text-[var(--brand-primary)]">{quoteNotice}</p>}
            <div className="rounded-2xl border p-4 sm:p-5">
              <p className="flex items-center gap-2 font-mono text-[12px] text-[var(--brand-primary)]"><Share2 size={14} /> Partager cette annonce</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["WhatsApp", "Facebook", "Copier"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => shareProduct(label)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold"
                  >
                    {label === "Copier" ? <Copy size={14} /> : <Share2 size={14} />} {label}
                  </button>
                ))}
              </div>
              {shareNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">{shareNotice}</p>}
            </div>
            <div className="rounded-2xl border p-4 sm:p-5">
              <button
                type="button"
                onClick={() => { setReportOpen((current) => !current); setReportNotice(""); }}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-red-700"
              >
                <Flag size={14} /> Signaler cette annonce
              </button>
              {reportOpen && (
                <div className="mt-3 space-y-2">
                  <select
                    value={reportReasonCategory}
                    onChange={(event) => setReportReasonCategory(event.target.value as ReportReasonCategory)}
                    className="h-10 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                  >
                    <option value="">Choisir un motif...</option>
                    {REPORT_REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={reportDetail}
                    onChange={(event) => setReportDetail(event.target.value)}
                    placeholder="Détail (facultatif)"
                    className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-[13px]"
                  />
                  <button
                    type="button"
                    disabled={reportMutation.isPending}
                    onClick={submitReport}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-red-600 px-4 text-[12px] font-semibold text-white disabled:opacity-60"
                  >
                    {reportMutation.isPending ? "Envoi..." : "Envoyer le signalement"}
                  </button>
                </div>
              )}
              {reportNotice && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">{reportNotice}</p>}
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}





