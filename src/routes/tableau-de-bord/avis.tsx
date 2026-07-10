import { createFileRoute } from "@tanstack/react-router";
import { Flag, MessageSquareReply, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { RatingStars } from "@/components/shared/RatingStars";

export const Route = createFileRoute("/tableau-de-bord/avis")({
  head: () => ({ meta: [{ title: "Avis recus - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "professional", "admin", "super_admin"]}>
      <ReviewsPage />
    </ProtectedRoute>
  ),
});

type ReviewStatus = "published" | "pending" | "reported";

type ReviewItem = {
  id: string;
  author: string;
  target: string;
  rating: number;
  comment: string;
  date: string;
  status: ReviewStatus;
  reply?: string;
};

const initialReviews: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Awa K.",
    target: "Tisane kinkeliba premium",
    rating: 5,
    comment: "Produit bien emballe, gout propre et livraison rapide.",
    date: "2026-06-28",
    status: "published",
  },
  {
    id: "rev-2",
    author: "Mamadou S.",
    target: "Consultation phytotherapie",
    rating: 4,
    comment: "Conseils clairs. J'aurais aime recevoir le recapitulatif plus vite.",
    date: "2026-06-20",
    status: "published",
  },
  {
    id: "rev-3",
    author: "Client verifie",
    target: "Beurre de karite brut",
    rating: 3,
    comment: "Texture correcte mais le colis est arrive avec du retard.",
    date: "2026-06-12",
    status: "pending",
  },
];

const statusLabels: Record<ReviewStatus, string> = {
  published: "Publie",
  pending: "En attente",
  reported: "Signale",
};

function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const filteredReviews = useMemo(
    () => reviews.filter((review) => filter === "all" || review.status === filter),
    [filter, reviews],
  );
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const submitReply = (id: string) => {
    const reply = replyDrafts[id]?.trim() ?? "";
    if (reply.length < 5) {
      setMessage("Ajoutez une reponse plus precise avant d'enregistrer.");
      return;
    }

    setReviews((current) => current.map((review) => (review.id === id ? { ...review, reply } : review)));
    setReplyDrafts((current) => ({ ...current, [id]: "" }));
    setMessage("Reponse publique enregistree en mode test.");
  };

  const reportReview = (id: string) => {
    setReviews((current) => current.map((review) => (review.id === id ? { ...review, status: "reported" } : review)));
    setMessage("Avis signale a la moderation en mode test.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Profil</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Avis recus</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Suivez les retours clients, repondez publiquement et signalez les avis problematiques.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <Star size={22} className="text-[var(--brand-primary)]" />
            <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Moyenne</p>
            <p className="mt-1 text-[28px] font-extrabold">{average.toFixed(1)}/5</p>
          </div>
          <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Total</p>
            <p className="mt-2 text-[28px] font-extrabold">{reviews.length}</p>
          </div>
          <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">A traiter</p>
            <p className="mt-2 text-[28px] font-extrabold">{reviews.filter((review) => !review.reply).length}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["all", "Tous"],
            ["published", "Publies"],
            ["pending", "En attente"],
            ["reported", "Signales"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`h-10 rounded-full border px-4 text-[13px] font-semibold ${filter === value ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

        <div className="mt-6 space-y-4">
          {filteredReviews.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <Star className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucun avis dans ce filtre</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Les prochains avis clients apparaitront ici.</p>
            </div>
          )}

          {filteredReviews.map((review) => (
            <article key={review.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-[18px] font-bold">{review.author}</h2>
                    <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">
                      {statusLabels[review.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{review.target} - {review.date}</p>
                  <div className="mt-2"><RatingStars rating={review.rating} showCount={false} /></div>
                </div>
                <button
                  type="button"
                  onClick={() => reportReview(review.id)}
                  disabled={review.status === "reported"}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Flag size={15} /> Signaler
                </button>
              </div>

              <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{review.comment}</p>

              {review.reply && (
                <div className="mt-4 rounded-[8px] bg-[var(--brand-primary-subtle)] p-4 text-[13px] text-[var(--brand-primary)]">
                  <strong>Votre reponse :</strong> {review.reply}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <input
                  value={replyDrafts[review.id] ?? ""}
                  onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                  placeholder="Repondre publiquement a cet avis..."
                  className="h-11 min-w-0 flex-1 rounded-full border border-[var(--brand-border)] px-4 text-[14px]"
                />
                <button
                  type="button"
                  onClick={() => submitReply(review.id)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                >
                  <MessageSquareReply size={15} /> Repondre
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}