import { createFileRoute } from "@tanstack/react-router";
import { FileText, Loader2, Send, X } from "lucide-react";
import { useState } from "react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useDeclineQuote, useMyQuotes, useProposeQuote } from "@/hooks/useQuotesApi";
import type { QuoteStatus } from "@/lib/api/quotes";

export const Route = createFileRoute("/tableau-de-bord/devis")({
  head: () => ({ meta: [{ title: "Demandes de devis - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <SellerQuotesPage />
    </ProtectedRoute>
  ),
});

const statusLabels: Record<QuoteStatus, string> = {
  PENDING: "À traiter",
  PROPOSED: "Devis envoyé",
  ACCEPTED: "Accepté par le client",
  DECLINED: "Refusé",
};

const statusClasses: Record<QuoteStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  PROPOSED: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-border-light)]",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DECLINED: "bg-red-50 text-red-700 border-red-100",
};

function SellerQuotesPage() {
  const { data: quotes, isLoading, isError } = useMyQuotes("seller");
  const proposeQuote = useProposeQuote();
  const declineQuote = useDeclineQuote();
  const [drafts, setDrafts] = useState<Record<string, { price: string; note: string }>>({});
  const [message, setMessage] = useState("");
  const list = quotes ?? [];

  const draftFor = (id: string) => drafts[id] ?? { price: "", note: "" };

  const submitProposal = (id: string) => {
    const draft = draftFor(id);
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Indiquez un prix valide avant d'envoyer le devis.");
      return;
    }
    proposeQuote.mutate(
      { id, proposedPrice: price, responseNote: draft.note.trim() || undefined },
      {
        onSuccess: () => setMessage("Devis envoyé au client."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Impossible d'envoyer ce devis."),
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Boutique</p>
            <h1 className="mt-2 text-[32px] md:text-[42px]">Demandes de devis</h1>
            <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
              Répondez aux demandes de devis reçues sur vos annonces "Prix sur devis".
            </p>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        {message && <p className="mb-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger les demandes de devis pour le moment.
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
              <FileText className="mx-auto text-[var(--brand-primary)]" size={34} />
              <h2 className="mt-4 text-[20px] font-bold">Aucune demande de devis</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Les demandes de vos clients apparaîtront ici.</p>
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
                  Client : {quote.buyer.firstName} {quote.buyer.lastName}
                </p>
                {quote.message && <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">"{quote.message}"</p>}
                {quote.status === "PENDING" && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="number"
                      min={1}
                      value={draftFor(quote.id).price}
                      onChange={(event) => setDrafts((current) => ({ ...current, [quote.id]: { ...draftFor(quote.id), price: event.target.value } }))}
                      placeholder="Prix proposé (FCFA)"
                      className="h-10 rounded-lg border border-[var(--brand-border)] px-3 text-[13px] sm:w-48"
                    />
                    <input
                      value={draftFor(quote.id).note}
                      onChange={(event) => setDrafts((current) => ({ ...current, [quote.id]: { ...draftFor(quote.id), note: event.target.value } }))}
                      placeholder="Note (facultatif)"
                      className="h-10 flex-1 rounded-lg border border-[var(--brand-border)] px-3 text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => submitProposal(quote.id)}
                      disabled={proposeQuote.isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
                    >
                      <Send size={16} /> Envoyer
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
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
