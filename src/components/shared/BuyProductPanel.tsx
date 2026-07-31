import { useState } from "react";
import { CreditCard, Loader2, Smartphone, Wallet } from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrdersApi";
import { useInitiatePayment } from "@/hooks/usePaymentsApi";
import type { PaymentMethod } from "@/lib/api/payments";

const methods: { id: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { id: "wallet", label: "Portefeuille", icon: Wallet },
  { id: "card", label: "Carte bancaire", icon: CreditCard },
  { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
];

export function BuyProductPanel({
  productId,
  maxQuantity,
  isDigital,
}: {
  productId: string;
  maxQuantity?: number;
  isDigital: boolean;
}) {
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("wallet");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);

  const isPending = createOrder.isPending || initiatePayment.isPending;

  const buy = () => {
    setStatus("");
    createOrder.mutate(
      { productId, quantity, couponCode: couponCode.trim() || undefined },
      {
        onSuccess: (created) => {
          const orderId = created.data?.id;
          if (!orderId) {
            setStatus("Commande créée, mais impossible de récupérer son identifiant.");
            return;
          }
          initiatePayment.mutate(
            { orderId, method },
            {
              onSuccess: (payment) => {
                const checkoutUrl = payment.data?.checkoutUrl;
                if (checkoutUrl) {
                  window.location.href = checkoutUrl;
                  return;
                }
                setSuccess(true);
                setStatus("Paiement effectué avec succès. Retrouvez votre commande dans « Mes commandes ».");
              },
              onError: (error) => setStatus(error instanceof Error ? error.message : "Le paiement n'a pas pu être initié."),
            },
          );
        },
        onError: (error) => setStatus(error instanceof Error ? error.message : "Impossible de créer la commande."),
      },
    );
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">{status}</div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border p-4 sm:p-5">
      <p className="font-mono text-[12px] text-[var(--brand-primary)]">Acheter</p>
      <div className="flex flex-wrap items-center gap-3">
        {!isDigital && (
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            Quantité
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="h-10 w-20 rounded-lg border border-[var(--brand-border)] px-2 text-center outline-none focus:border-[var(--brand-primary)]"
            />
          </label>
        )}
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="Code coupon (facultatif)"
          className="h-10 flex-1 min-w-[160px] rounded-lg border border-[var(--brand-border)] px-3 text-[13px] outline-none focus:border-[var(--brand-primary)]"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {methods.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-[12px] font-semibold ${
              method === id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={buy}
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null} {isPending ? "Traitement..." : "Payer maintenant"}
      </button>
      {status && !success && <p className="text-[12px] font-semibold text-red-700">{status}</p>}
    </div>
  );
}
