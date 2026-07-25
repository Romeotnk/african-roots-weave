import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flag, MessageSquare, Star, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { publicProfiles } from "@/data/publicProfiles";
import { useProfessional } from "@/hooks/useApiCatalog";
import { useTargetReviews } from "@/hooks/useReviewsApi";
import { useForumReport } from "@/hooks/useForumApi";

export const Route = createFileRoute("/profil/$username")({
  head: () => ({ meta: [{ title: "Profil public - IWOSAN" }] }),
  component: PublicProfilePage,
});

type BackendReview = {
  id?: string;
  rating?: number;
  comment?: string | null;
  createdAt?: string;
  author?: { firstName?: string | null; lastName?: string | null } | null;
};

function PublicProfilePage() {
  const { username } = Route.useParams();
  const professionalQuery = useProfessional(username);
  const reviewsQuery = useTargetReviews(username, "PROFESSIONAL", Boolean(professionalQuery.data));
  const reportMutation = useForumReport();

  const apiReviews = useMemo(
    () => ((reviewsQuery.data ?? []) as BackendReview[]).filter((review) => review.id),
    [reviewsQuery.data],
  );

  const fallbackProfile = publicProfiles.find((item) => item.username === username) ?? publicProfiles[0];
  const professional = professionalQuery.data;
  const [reportNotice, setReportNotice] = useState("");

  if (!professional) {
    const profile = fallbackProfile;
    return (
      <main className="bg-[var(--brand-bg)]">
        <section className="bg-[var(--brand-primary-dark)] py-12 text-white">
          <div className="container-iwosan flex flex-col gap-6 md:flex-row md:items-center">
            <img src={profile.avatar} alt={profile.name} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-iwosan-md" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/60">@{profile.username}</p>
              <h1 className="mt-2 text-[34px] md:text-[48px] text-white">{profile.name}</h1>
              <p className="mt-2 text-white/75">{profile.role} - {profile.country} - membre depuis {profile.memberSince}</p>
            </div>
          </div>
        </section>
        <section className="container-iwosan grid gap-6 py-10 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            {[
              ["Réputation forum", `${profile.reputation}/100`, Trophy],
              ["Note vendeur", `${profile.sellerRating}/5`, Star],
              ["Fiabilité acheteur", `${profile.buyerReliability}%`, UserRound],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
                <Icon className="text-[var(--brand-primary)]" size={20} />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label as string}</p>
                <p className="mt-1 text-[26px] font-black">{value as string}</p>
              </div>
            ))}
          </aside>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 shadow-iwosan-sm">
            <h2 className="text-[24px] font-bold">Avis reçus</h2>
            <div className="mt-5 grid gap-4">
              {profile.reviews.map((review) => (
                <article key={`${review.from}-${review.comment}`} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{review.from}</strong>
                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">{review.type} - {review.rating}/5</span>
                  </div>
                  <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{review.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[var(--brand-bg)]">
      <section className="bg-[var(--brand-primary-dark)] py-12 text-white">
        <div className="container-iwosan flex flex-col gap-6 md:flex-row md:items-center">
          <img src={professional.avatar} alt={professional.name} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-iwosan-md" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/60">{professional.specialty}</p>
            <h1 className="mt-2 flex items-center gap-2 text-[34px] md:text-[48px] text-white">
              {professional.name}
              {professional.verified && <ShieldCheck size={26} className="text-emerald-300" />}
            </h1>
            <p className="mt-2 text-white/75">{professional.location} - {professional.country}</p>
          </div>
          {reportNotice && (
            <p className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-[13px] font-semibold text-white/90 md:basis-full">
              {reportNotice}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Link to="/pro/$id" params={{ id: professional.id }} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[13px] font-bold text-white">
              Voir la page pro
            </Link>
            <Link to="/messages" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[var(--brand-primary-dark)]">
              <MessageSquare size={16} /> Contacter
            </Link>
            <button
              type="button"
              onClick={() => {
                reportMutation.mutate(
                  { targetId: professional.id, targetType: "PROFILE", reason: "Profil signalé" },
                  { onSuccess: () => setReportNotice(`Signalement envoyé pour ${professional.name}. Notre equipe de moderation va examiner ce profil.`) },
                );
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[13px] font-bold text-white"
            >
              <Flag size={16} /> Signaler
            </button>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          {[
            ["Note moyenne", `${professional.rating.toFixed(1)}/5`, Star],
            ["Avis reçus", professional.reviewCount.toString(), UserRound],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
              <Icon className="text-[var(--brand-primary)]" size={20} />
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label as string}</p>
              <p className="mt-1 text-[26px] font-black">{value as string}</p>
            </div>
          ))}
          {professional.specialties.length > 0 && (
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Spécialités</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {professional.specialties.map((item) => (
                  <span key={item} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">{item}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 shadow-iwosan-sm">
          <h2 className="text-[24px] font-bold">Avis reçus</h2>
          <div className="mt-5 grid gap-4">
            {apiReviews.length === 0 && (
              <p className="text-[14px] text-[var(--color-text-muted)]">Aucun avis pour le moment.</p>
            )}
            {apiReviews.map((review) => (
              <article key={review.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{[review.author?.firstName, review.author?.lastName].filter(Boolean).join(" ") || "Membre Iwosan"}</strong>
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">{review.rating}/5</span>
                </div>
                {review.comment && <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{review.comment}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
