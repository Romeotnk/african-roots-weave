import { createFileRoute, Link } from "@tanstack/react-router";
import { Flag, MessageSquare, Star, Store, Trophy, UserRound } from "lucide-react";
import { publicProfiles } from "@/data/publicProfiles";

export const Route = createFileRoute("/profil/$username")({
  head: () => ({ meta: [{ title: "Profil public - IWOSAN" }] }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { username } = Route.useParams();
  const profile = publicProfiles.find((item) => item.username === username) ?? publicProfiles[0];

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
          <div className="flex flex-wrap gap-2">
            <Link to="/messages" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[var(--brand-primary-dark)]">
              <MessageSquare size={16} /> Contacter
            </Link>
            <button className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[13px] font-bold text-white">
              <Flag size={16} /> Signaler
            </button>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          {[
            ["Reputation forum", `${profile.reputation}/100`, Trophy],
            ["Annonces actives", profile.activeListings.toString(), Store],
            ["Note vendeur", `${profile.sellerRating}/5`, Star],
            ["Fiabilite acheteur", `${profile.buyerReliability}%`, UserRound],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
              <Icon className="text-[var(--brand-primary)]" size={20} />
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label as string}</p>
              <p className="mt-1 text-[26px] font-black">{value as string}</p>
            </div>
          ))}
        </aside>

        <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 shadow-iwosan-sm">
          <h2 className="text-[24px] font-bold">Avis recus</h2>
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
