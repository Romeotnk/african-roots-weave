import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Flag, MessageSquareReply, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { RatingStars } from "@/components/shared/RatingStars";

export const Route = createFileRoute("/tableau-de-bord/avis")({
  head: () => ({ meta: [{ title: "Avis reçus - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["researcher", "professional", "admin", "super_admin"]}>
      <ReviewsPage />
    </ProtectedRoute>
  ),
});

type ReviewStatus = "published" | "pending" | "reported" | "hidden";

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
  published: "Publié",
  pending: "En attente",
  reported: "Signalé",
  hidden: "Masqué",
};

function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const filteredReviews = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus = filter === "all" || review.status === filter;
      const matchesSearch =
        !normalized ||
        review.author.toLowerCase().includes(normalized) ||
        review.target.toLowerCase().includes(normalized) ||
        review.comment.toLowerCase().includes(normalized);
      return matchesStatus && matchesSearch;
    });
  }, [filter, query, reviews]);
  const publicReviews = reviews.filter((review) => review.status === "published");
  const average = publicReviews.length ? publicReviews.reduce((sum, review) => sum + review.rating, 0) / publicReviews.length : 0;

  const submitReply = (id: string) => {
    const reply = replyDrafts[id]?.trim() ?? "";
    if (reply.length < 5) {
      setMessage("Ajoutez une reponse plus precise avant d'enregistrer.");
      return;
    }

    setReviews((current) => current.map((review) => (review.id === id ? { ...review, reply, status: review.status === "pending" ? "published" : review.status } : review)));
    setReplyDrafts((current) => ({ ...current, [id]: "" }));
    setMessage("Réponse publique enregistrée.");
  };

  const setReviewStatus = (id: string, status: ReviewStatus) => {
    setReviews((current) => current.map((review) => (review.id === id ? { ...review, status } : review)));
    setMessage(status === "published" ? "Avis publié." : status === "reported" ? "Avis signalé à la modération." : "Avis masqué.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Profil professionnel</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Avis reçus</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Suivez les retours clients, répondez publiquement et signalez les avis problématiques.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <Star size={22} className="text-[var(--brand-primary)]" />
            <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Moyenne publique</p>
            <p className="mt-1 text-[28px] font-extrabold">{average.toFixed(1)}/5</p>
          </div>
          <StatBox label="Total" value={reviews.length} />
          <StatBox label="À traiter" value={reviews.filter((review) => !review.reply && review.status !== "hidden").length} />
          <StatBox label="En attente" value={reviews.filter((review) => review.status === "pending").length} />
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un avis..." className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {([[
              "all", "Tous"],
              ["published", "Publiés"],
              ["pending", "En attente"],
              ["reported", "Signalés"],
              ["hidden", "Masqués"],
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
                    <h2 className="text-[18px] font-bold">{review.author}</h2>
                    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${review.status === "reported" ? "bg-rose-50 text-rose-700" : review.status === "hidden" ? "bg-slate-100 text-slate-600" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"}`}>
                      {statusLabels[review.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{review.target} - {review.date}</p>
                  <div className="mt-2"><RatingStars rating={review.rating} showCount={false} /></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.status !== "published" && (
                    <button type="button" onClick={() => setReviewStatus(review.id, "published")} className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-200 px-4 text-[13px] font-semibold text-emerald-700">
                      <CheckCircle2 size={15} /> Publiér
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setReviewStatus(review.id, "reported")}
                    disabled={review.status === "reported"}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Flag size={15} /> Signalér
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus(review.id, "hidden")}
                    disabled={review.status === "hidden"}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={15} /> Masquér
                  </button>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{review.comment}</p>

              {review.reply && (
                <div className="mt-4 rounded-[8px] bg-[var(--brand-primary-subtle)] p-4 text-[13px] text-[var(--brand-primary)]">
                  <strong>Votre réponse :</strong> {review.reply}
                </div>
              )}

              {review.status !== "hidden" && (
                <div className="mt-4 flex flex-col gap-2 md:flex-row">
                  <input
                    value={replyDrafts[review.id] ?? ""}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                    placeholder="Répondre publiquement à cet avis..."
                    className="h-11 min-w-0 flex-1 rounded-full border border-[var(--brand-border)] px-4 text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => submitReply(review.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                  >
                    <MessageSquareReply size={15} /> Répondre
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
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
