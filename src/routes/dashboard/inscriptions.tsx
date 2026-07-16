import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, XCircle } from "lucide-react";
import { useState } from "react";
import { RouteRedirect } from "@/components/RouteRedirect";
import { events } from "@/data/events";

export const Route = createFileRoute("/dashboard/inscriptions")({
  head: () => ({ meta: [{ title: "Mes inscriptions - IWOSAN" }] }),
  component: () => <RouteRedirect to="/mon-compte/inscriptions" label="Ouverture de vos inscriptions..." />,
});

type Registration = (typeof events)[number] & { localStatus: "confirmed" | "pending" | "cancelled" };

export function Registrations() {
  const [registrations, setRegistrations] = useState<Registration[]>(
    events.slice(0, 3).map((event) => ({
      ...event,
      localStatus: event.status === "cancelled" ? "cancelled" : event.status === "pending" ? "pending" : "confirmed",
    })),
  );
  const [actionMessage, setActionMessage] = useState("");

  const cancelRegistration = (id: string) => {
    setRegistrations((current) =>
      current.map((event) => (event.id === id ? { ...event, localStatus: "cancelled" } : event)),
    );
    setActionMessage("Inscription annulée. Une confirmation sera visible dans vos notifications.");
  };

  const downloadTicket = (title: string) => {
    setActionMessage(`Billet préparé pour ${title}. Vous pouvez le présenter depuis cet espace.`);
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="container-iwosan py-10">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Agenda</p>
        <h1 className="mt-2 text-[34px] md:text-[44px]">Mes inscriptions</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
          Retrouvez vos événements, formations et webinaires réservés depuis l'agenda.
        </p>

        {actionMessage && (
          <p className="mt-6 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {registrations.length === 0 && (
            <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <CalendarDays className="mx-auto text-[var(--brand-primary)]" size={28} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune inscription</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                Vos prochaines inscriptions apparaîtront ici après réservation.
              </p>
            </div>
          )}

          {registrations.map((event) => {
            const isCancelled = event.localStatus === "cancelled";
            return (
              <article key={event.id} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{event.title}</p>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.date))} - {event.location}
                    </p>
                    <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
                      {event.online ? "Participation en ligne" : event.address ?? "Adresse à confirmer"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${isCancelled ? "bg-rose-50 text-rose-700" : "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"}`}>
                    {event.localStatus === "pending" ? "En attente" : isCancelled ? "Annulé" : "Confirmé"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/agenda" className="inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                    Voir l'agenda
                  </Link>
                  <button
                    type="button"
                    onClick={() => downloadTicket(event.title)}
                    disabled={isCancelled}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={15} /> Billet
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelRegistration(event.id)}
                    disabled={isCancelled}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle size={15} /> Annulér
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <Link to="/agenda" className="mt-6 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
          Retour agenda
        </Link>
      </section>
    </main>
  );
}