import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileText, Loader2, X } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAcceptQuote, useDeclineQuote, useMyQuotes } from "@/hooks/useQuotesApi";
import type { QuoteStatus } from "@/lib/api/quotes";

export const Route = createFileRoute("/mon-compte/devis")({
  head: () => ({ meta: [{ title: "Mes devis - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <MyQuotesPage />
    </ProtectedRoute>
  ),
});

const statusLabels: Record<QuoteStatus, string> = {
  PENDING: "En attente du vendeur",
  PROPOSED: "Devis reçu",
  ACCEPTED: "Accepté",
  DECLINED: "Refusé",
};

const statusClasses: Record<QuoteStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  PROPOSED: "bg-amber-50 text-amber-700 border-amber-100",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DECLINED: "bg-red-50 text-red-700 border-red-100",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function MyQuotesPage() {
  const { data: quotes, isLoading, isError } = useMyQuotes("buyer");
  const acceptQuote = useAcceptQuote();
  const declineQuote = useDeclineQuote();
  const list = quotes ?? [];

  return (
    <AccountLayout
      title="Mes devis"
      description="Suivez vos demandes de devis et acceptez la proposition d'un vendeur pour créer votre commande."
    >
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger vos devis pour le moment.
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
              <FileText className="mx-auto text-[var(--brand-primary)]" size={34} />
              <h2 className="mt-4 text-[20px] font-bold">Aucun devis demandé</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Sur une annonce "Prix sur devis", utilisez le bouton "Demander un devis".
              </p>
            </div>
          ) : (
            list.map((quote) => (
              <article key={quote.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{quote.product.title}</h2>
                  <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[quote.status]}`}>
                    {statusLabels[quote.status]}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  Vendeur : {quote.seller.firstName} {quote.seller.lastName}
                </p>
                {quote.status === "PROPOSED" && quote.proposedPrice && (
                  <div className="mt-3 rounded-lg bg-[var(--brand-surface-alt)] p-3">
                    <p className="text-[15px] font-extrabold text-[var(--brand-primary)]">{formatMoney(Number(quote.proposedPrice))}</p>
                    {quote.responseNote && <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{quote.responseNote}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => acceptQuote.mutate(quote.id)}
                        disabled={acceptQuote.isPending}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} /> Accepter et commander
                      </button>
                      <button
                        type="button"
                        onClick={() => declineQuote.mutate(quote.id)}
                        disabled={declineQuote.isPending}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 disabled:opacity-50"
                      >
                        <X size={16} /> Refuser
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
    </AccountLayout>
  );
}
