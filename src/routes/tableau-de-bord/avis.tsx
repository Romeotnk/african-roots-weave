import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareReply, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { RatingStars } from "@/components/shared/RatingStars";
import { useMyReceivedReviews, useReplyToReview } from "@/hooks/useReviewsApi";

export const Route = createFileRoute("/tableau-de-bord/avis")({
  head: () => ({ meta: [{ title: "Avis reçus - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <ReviewsPage />
    </ProtectedRoute>
  ),
});

const targetLabels: Record<string, string> = {
  PRODUCT: "Produit",
  PROFESSIONAL: "Profil professionnel",
  FORMATION: "Formation",
  BUYER: "Client",
};

function ReviewsPage() {
  const reviewsQuery = useMyReceivedReviews();
  const replyToReview = useReplyToReview();
  const [query, setQuery] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const reviews = reviewsQuery.data ?? [];

  const filteredReviews = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return reviews;
    return reviews.filter(
      (review) =>
        `${review.author.firstName} ${review.author.lastName}`.toLowerCase().includes(normalized) ||
        (review.comment ?? "").toLowerCase().includes(normalized),
    );
  }, [query, reviews]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const withoutReply = reviews.filter((review) => !review.sellerReply).length;

  const submitReply = (id: string) => {
    const content = replyDrafts[id]?.trim() ?? "";
    setMessage("");
    if (content.length < 5) {
      setMessage("Ajoutez une réponse plus précise avant d'enregistrer.");
      return;
    }
    replyToReview.mutate(
      { id, content },
      {
        onSuccess: () => {
          setReplyDrafts((current) => ({ ...current, [id]: "" }));
          setMessage("Réponse publique enregistrée.");
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : "Impossible d'enregistrer la réponse."),
      },
    );
  };

  return (
    <AccountLayout
      title="Avis reçus"
      description="Suivez les retours clients sur vos produits et votre profil, et répondez-y publiquement."
    >
        {reviewsQuery.isLoading && <p className="text-[14px] text-[var(--color-text-muted)]">Chargement...</p>}
        {reviewsQuery.isError && (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">Impossible de charger vos avis.</p>
        )}

        {!reviewsQuery.isLoading && !reviewsQuery.isError && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                <Star size={22} className="text-[var(--brand-primary)]" />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Moyenne</p>
                <p className="mt-1 text-[28px] font-extrabold">{average.toFixed(1)}/5</p>
              </div>
              <StatBox label="Total" value={reviews.length} />
              <StatBox label="Sans réponse" value={withoutReply} />
            </div>

            <div className="mt-6">
              <label className="relative block max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un avis..." className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
              </label>
            </div>

            {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

            <div className="mt-6 space-y-4">
              {filteredReviews.length === 0 && (
                <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
                  <Star className="mx-auto text-[var(--brand-primary)]" size={32} />
                  <h2 className="mt-3 text-[20px] font-bold">Aucun avis trouvé</h2>
                  <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Les prochains avis clients apparaîtront ici.</p>
                </div>
              )}

              {filteredReviews.map((review) => (
                <article key={review.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-[18px] font-bold">{review.author.firstName} {review.author.lastName}</h2>
                        <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">
                          {targetLabels[review.targetType] ?? review.targetType}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
                      <div className="mt-2"><RatingStars rating={review.rating} showCount={false} /></div>
                    </div>
                  </div>

                  {review.comment && <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{review.comment}</p>}

                  {review.sellerReply ? (
                    <div className="mt-4 rounded-[8px] bg-[var(--brand-primary-subtle)] p-4 text-[13px] text-[var(--brand-primary)]">
                      <strong>Votre réponse :</strong> {review.sellerReply}
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2 md:flex-row">
                      <input
                        value={replyDrafts[review.id] ?? ""}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                        placeholder="Répondre publiquement à cet avis..."
                        className="h-11 min-w-0 flex-1 rounded-full border border-[var(--brand-border)] px-4 text-[14px]"
                      />
                      <button
                        type="button"
                        disabled={replyToReview.isPending}
                        onClick={() => submitReply(review.id)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-60"
                      >
                        <MessageSquareReply size={15} /> Répondre
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
    </AccountLayout>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-[28px] font-extrabold">{value}</p>
    </div>
  );
}
