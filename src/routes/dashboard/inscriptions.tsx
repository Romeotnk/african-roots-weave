import { createFileRoute, Link } from "@tanstack/react-router";
import { events } from "@/data/events";

export const Route = createFileRoute("/dashboard/inscriptions")({
  head: () => ({ meta: [{ title: "Mes inscriptions - IWOSAN" }] }),
  component: Registrations,
});

function Registrations() {
  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="container-iwosan py-10">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Agenda</p>
        <h1 className="mt-2 text-[34px] md:text-[44px]">Mes inscriptions</h1>
        <div className="mt-8 space-y-4">
          {events.slice(0, 3).map((event) => (
            <article key={event.id} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{event.title}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.date))} · {event.location}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">
                  {event.status === "pending" ? "En attente" : event.status === "cancelled" ? "Annule" : "Confirme"}
                </span>
              </div>
            </article>
          ))}
        </div>
        <Link to="/agenda" className="mt-6 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
          Retour agenda
        </Link>
      </section>
    </main>
  );
}
