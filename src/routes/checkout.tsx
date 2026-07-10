import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, MapPin, ShieldCheck, ShoppingBag, Wallet } from "lucide-react";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { useCart } from "@/cart/CartContext";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Validation de commande - IWOSAN" }] }),
  component: CheckoutPage,
});

const deliveryModes = [
  "A retirer chez le vendeur",
  "Livraison standard",
  "Express",
];

const paymentMethods = [
  { id: "wallet", label: "Portefeuille Iwosan", icon: Wallet, desc: "Solde disponible mock: 42 000 FCFA" },
  { id: "moneroo", label: "Mobile Money", icon: CreditCard, desc: "Integration paiement a brancher plus tard" },
  { id: "bank", label: "Virement bancaire", icon: ShieldCheck, desc: "Instructions affichees apres validation" },
];

function CheckoutPage() {
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("BJ");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState(deliveryModes[1]);
  const [payment, setPayment] = useState(paymentMethods[1].id);
  const [stepError, setStepError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const hasPhysical = useMemo(() => cart.items.some((item) => item.product.type === "physical"), [cart.items]);
  const requiresAddress = hasPhysical && delivery !== deliveryModes[0];
  const orderNumber = "CMD-2026-" + String(1100 + cart.itemCount).padStart(4, "0");

  const validateCurrentStep = () => {
    if (step === 0 && hasPhysical) {
      if (!city.trim()) {
        setStepError("Indiquez la ville de livraison ou de retrait.");
        return false;
      }
      if (requiresAddress && !address.trim()) {
        setStepError("Indiquez une adresse complete pour la livraison.");
        return false;
      }
    }

    if (step === 1 && !payment) {
      setStepError("Choisissez un mode de reglement provisoire.");
      return false;
    }

    setStepError("");
    return true;
  };

  const goToStep = (targetStep: number) => {
    if (targetStep <= step) {
      setStepError("");
      setStep(targetStep);
      return;
    }

    if (validateCurrentStep()) setStep(Math.min(2, targetStep));
  };

  const confirm = () => {
    if (cart.items.length === 0 || !validateCurrentStep()) return;
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
      cart.clearCart();
    }, 700);
  };

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="container-iwosan py-16">
          <div className="mx-auto max-w-2xl rounded-[16px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
            <h1 className="mt-4 text-[32px]">Commande enregistree</h1>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Numero de commande : {orderNumber}</p>
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              Le paiement reel n'est pas encore active. Cette validation garde le parcours pret pour la prochaine integration.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/mes-commandes" className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
                Suivre ma commande
              </Link>
              <Link to="/marketplace" className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand-border)] px-5 font-semibold">
                Continuer mes achats
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="container-iwosan py-16">
          <div className="mx-auto max-w-xl rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
            <ShoppingBag className="mx-auto text-[var(--brand-primary)]" size={48} />
            <h1 className="mt-4 text-[30px]">Votre panier est vide</h1>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
              Ajoutez au moins un produit avant de valider une commande.
            </p>
            <Link to="/marketplace" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
              Retour a la marketplace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <Link to="/panier" className="text-[13px] font-semibold text-[var(--brand-primary)]">
            Retour au panier
          </Link>
          <h1 className="mt-3 text-[32px] md:text-[42px]">Validation de commande</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Livraison", "Reglement", "Confirmation"].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(index)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold ${step === index ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          {stepError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-[13px] font-semibold text-red-700">{stepError}</p>}

          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-[22px] font-bold">Livraison</h2>
              {!hasPhysical && (
                <p className="rounded-lg bg-[var(--brand-primary-subtle)] p-3 text-[13px] text-[var(--brand-primary)]">
                  Votre panier ne contient que des services ou produits digitaux.
                </p>
              )}
              {hasPhysical && (
                <>
                  <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ville" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                    <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder={requiresAddress ? "Adresse complete" : "Adresse facultative"} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                  </div>
                </>
              )}
              <div className="grid md:grid-cols-3 gap-3">
                {deliveryModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDelivery(mode)}
                    className={`rounded-[12px] border-2 p-4 text-left text-[13px] font-semibold ${delivery === mode ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)]"}`}
                  >
                    <MapPin size={18} className="mb-2 text-[var(--brand-primary)]" /> {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-[22px] font-bold">Reglement</h2>
              <p className="rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4 text-[13px]">
                Paiement reel non active pour l'instant. Ce choix sert a preparer le recapitulatif de commande.
              </p>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPayment(method.id)}
                    className={`flex items-center gap-3 rounded-[12px] border-2 p-4 text-left ${payment === method.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)]"}`}
                  >
                    <method.icon size={21} className="text-[var(--brand-primary)]" />
                    <div>
                      <p className="font-bold">{method.label}</p>
                      <p className="text-[12px] text-[var(--color-text-muted)]">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {payment === "bank" && (
                <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
                  Banque: Iwosan Trust Bank - IBAN mock BJ00 IWOS 2026 0001.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-[22px] font-bold">Recapitulatif</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                    <span>{item.quantity} x {item.product.title}</span>
                    <strong>{(item.quantity * item.product.price).toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                ))}
              </div>
              {hasPhysical && (
                <p className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                  {delivery} - {city}, {country}{address ? ` - ${address}` : ""}
                </p>
              )}
              <button
                type="button"
                onClick={confirm}
                disabled={processing || cart.items.length === 0}
                className="h-12 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-60"
              >
                {processing ? "Validation..." : "Confirmer la commande"}
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-[var(--brand-border-light)] pt-5">
            <button type="button" onClick={() => goToStep(Math.max(0, step - 1))} disabled={step === 0} className="h-10 rounded-full border border-[var(--brand-border)] px-4 font-semibold disabled:opacity-50">
              Retour
            </button>
            {step < 2 && (
              <button type="button" onClick={() => goToStep(step + 1)} className="h-10 rounded-full bg-[var(--brand-primary)] px-4 font-semibold text-white">
                Continuer
              </button>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="font-bold">Total</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex justify-between"><dt>Sous-total</dt><dd>{cart.subtotal.toLocaleString("fr-FR")} FCFA</dd></div>
            <div className="flex justify-between"><dt>Reduction</dt><dd>-{cart.discount.toLocaleString("fr-FR")} FCFA</dd></div>
            <div className="flex justify-between"><dt>Frais</dt><dd>{cart.serviceFee.toLocaleString("fr-FR")} FCFA</dd></div>
            <div className="flex justify-between border-t border-[var(--brand-border-light)] pt-3 text-[18px] font-extrabold"><dt>Total</dt><dd>{cart.total.toLocaleString("fr-FR")} FCFA</dd></div>
          </dl>
        </aside>
      </section>
    </main>
  );
}