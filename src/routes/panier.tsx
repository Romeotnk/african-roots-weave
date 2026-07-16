import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/cart/CartContext";
import { useValidateCoupon } from "@/hooks/useCouponsApi";

export const Route = createFileRoute("/panier")({
  head: () => ({ meta: [{ title: "Panier - IWOSAN" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, discount, serviceFee, total, coupon, updateQuantity, removeItem, applyCoupon, clearCart } = useCart();
  const [couponInput, setCouponInput] = useState(coupon);
  const [couponMessage, setCouponMessage] = useState("");
  const validateCoupon = useValidateCoupon();

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Saisissez un code coupon.");
      return;
    }

    try {
      const validated = await validateCoupon.mutateAsync(code);
      if (validated) {
        applyCoupon(code);
        setCouponMessage(`Coupon ${code} valide et appliqué.`);
        return;
      }
      setCouponMessage(`Coupon ${code} invalide.`);
    } catch {
      applyCoupon(code);
      setCouponMessage(`Coupon ${code} appliqué à votre panier.`);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <h1 className="text-[32px] md:text-[42px]">Panier</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Votre panier est conservé pendant votre navigation et restera accessible après connexion.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8">
        {items.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-12 text-center">
            <ShoppingBag className="mx-auto text-[var(--brand-primary)]" size={44} />
            <h2 className="mt-4 text-[24px]">Votre panier est vide</h2>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white"
            >
              Explorer la marketplace
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.product.id} className="flex flex-col gap-4 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-4 md:flex-row md:items-center">
                  <img src={item.product.image} alt="" className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h2 className="font-bold">{item.product.title}</h2>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{item.product.sellerName}</p>
                    <p className="mt-2 font-bold text-[var(--brand-primary)]">
                      {item.product.price.toLocaleString("fr-FR")} {item.product.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--brand-border)]" aria-label="Diminuer la quantite">
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--brand-border)]" aria-label="Augmenter la quantite">
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{(item.product.price * item.quantity).toLocaleString("fr-FR")} {item.product.currency}</p>
                    <button type="button" onClick={() => removeItem(item.product.id)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-red-600">
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">Récapitulatif</h2>
                <button type="button" onClick={clearCart} className="text-[12px] font-semibold text-red-600">
                  Vider
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Code coupon" className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--brand-border)] px-3" />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validateCoupon.isPending}
                  className="h-10 rounded-lg bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-60"
                >
                  {validateCoupon.isPending ? "Vérification..." : "Appliquer"}
                </button>
              </div>
              {coupon && <p className="mt-2 text-[12px] text-emerald-700">Coupon {coupon} appliqué.</p>}
              {couponMessage && <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{couponMessage}</p>}
              <dl className="mt-5 space-y-3 text-[14px]">
                <div className="flex justify-between"><dt>Sous-total</dt><dd>{subtotal.toLocaleString("fr-FR")} FCFA</dd></div>
                <div className="flex justify-between"><dt>Réduction</dt><dd>-{discount.toLocaleString("fr-FR")} FCFA</dd></div>
                <div className="flex justify-between"><dt>Frais de service</dt><dd>{serviceFee.toLocaleString("fr-FR")} FCFA</dd></div>
                <div className="flex justify-between border-t border-[var(--brand-border-light)] pt-3 text-[18px] font-extrabold"><dt>Total</dt><dd>{total.toLocaleString("fr-FR")} FCFA</dd></div>
              </dl>
              <Link to="/checkout" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-primary)] font-semibold text-white">
                Valider mon panier
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}