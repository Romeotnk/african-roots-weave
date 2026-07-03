import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, DollarSign, Eye, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { proBookings, proReviews } from "@/data/proDashboard";
import { RatingStars } from "@/components/shared/RatingStars";

export const Route = createFileRoute("/dashboard/pro")({
  head: () => ({ meta: [{ title: "Dashboard professionnel - IWOSAN" }] }),
  component: ProDashboard,
});

function ProDashboard() {
  const [view, setView] = useState<"week" | "month">("week");
  const [note, setNote] = useState("");

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">Espace praticien</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Dashboard professionnel</h1>
        </div>
      </section>

      <section className="container-iwosan space-y-6 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Vues profil", "1 284", Eye],
            ["Demandes consultation", "18", MessageSquare],
            ["Note moyenne", "4.9", Star],
            ["Revenus du mois", "248 500 FCFA", DollarSign],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <Icon size={18} className="text-[var(--brand-primary)]" />
              <p className="mt-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label as string}</p>
              <p className="mt-2 text-[24px] font-extrabold">{value as string}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[20px] font-bold"><CalendarDays size={20} /> Consultations</h2>
              <div className="inline-flex rounded-full border border-[var(--brand-border)] p-1">
                {["week", "month"].map((item) => (
                  <button key={item} onClick={() => setView(item as "week" | "month")} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${view === item ? "bg-[var(--brand-primary)] text-white" : ""}`}>
                    {item === "week" ? "Semaine" : "Mois"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[12px]">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                <div key={`${day}-${index}`} className="rounded-lg bg-[var(--brand-surface-alt)] p-3">
                  <p className="font-bold">{day}</p>
                  <div className={`mx-auto mt-2 h-10 w-full rounded ${index === 2 || index === 4 ? "bg-[var(--brand-primary)]" : "bg-white"}`} />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {proBookings.map((booking) => (
                <article key={booking.id} className="rounded-lg border border-[var(--brand-border-light)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{booking.patientName}</p>
                      <p className="text-[13px] text-[var(--color-text-muted)]">{booking.date} a {booking.time} - {booking.mode === "online" ? "En ligne" : "Presentiel"}</p>
                      <p className="mt-1 text-[13px]">{booking.reason}</p>
                    </div>
                    <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--brand-primary)]">{booking.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="h-9 rounded-full bg-[var(--brand-primary)] px-4 text-[12px] font-semibold text-white">Confirmer</button>
                    <button className="h-9 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold">Annuler</button>
                    <button className="h-9 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold">Marquer effectuee</button>
                  </div>
                </article>
              ))}
            </div>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Notes privees post-consultation" className="mt-5 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
          </div>

          <aside className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[20px] font-bold">Avis recus</h2>
            <div className="mt-4 space-y-4">
              {proReviews.map((review) => (
                <article key={review.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{review.authorName}</p>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">{review.comment}</p>
                  {review.response ? (
                    <p className="mt-3 rounded-lg bg-white p-3 text-[12px]">Reponse: {review.response}</p>
                  ) : (
                    <button className="mt-3 h-8 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold">Repondre</button>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
              <CheckCircle2 size={15} className="inline" /> Tous les avis restent moderes avant publication.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
