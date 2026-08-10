import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { RouteRedirect } from "@/components/RouteRedirect";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useMeQuery } from "@/hooks/useAuthApi";
import { useMyRegistrations, useUnregisterEvent } from "@/hooks/useEventsFormationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/dashboard/inscriptions")({
  head: () => ({ meta: [{ title: "Mes inscriptions - IWOSAN" }] }),
  component: () => <RouteRedirect to="/mon-compte/inscriptions" label="Ouverture de vos inscriptions..." />,
});

type Registration = EventItem & { localStatus: "confirmed" | "pending" | "cancelled" };

type BackendRegistration = { eventId?: string; event?: BackendEvent };

export function Registrations() {
  const registrationsQuery = useMyRegistrations();
  const unregister = useUnregisterEvent();
  const { data: profile } = useMeQuery();
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState("");

  const registrations = useMemo(
    () =>
      ((registrationsQuery.data ?? []) as BackendRegistration[])
        .map((registration) => (registration.event ? toEventItem(registration.event) : null))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((event): Registration => ({ ...event, localStatus: cancelledIds.includes(event.id) ? "cancelled" : "confirmed" })),
    [registrationsQuery.data, cancelledIds],
  );

  const cancelRegistration = (id: string) => {
    unregister.mutate(id, {
      onSuccess: () => {
        setCancelledIds((current) => [...current, id]);
        setActionMessage("Inscription annulée. Une confirmation sera visible dans vos notifications.");
      },
      onError: (error) => {
        setActionMessage(error instanceof Error ? error.message : "Impossible d'annuler cette inscription.");
      },
    });
  };

  const downloadTicket = (event: Registration) => {
    const lines = [
      "IWOSAN - Confirmation d'inscription",
      "",
      `Evenement : ${event.title}`,
      `Date : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date(event.date))}`,
      `Lieu : ${event.online ? "En ligne" : (event.address ?? event.location)}`,
      `Participant : ${profile ? `${profile.firstName} ${profile.lastName}` : "Compte Iwosan"}`,
      `Reference : ${event.id}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billet-${event.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setActionMessage(`Billet telecharge pour ${event.title}.`);
  };

  return (
    <AccountLayout
      title="Mes inscriptions"
      description="Retrouvez vos événements, formations et webinaires réservés depuis l'agenda."
    >
        {actionMessage && (
          <p className="mt-6 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {registrationsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-[12px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : registrationsQuery.isError ? (
            <div className="rounded-[12px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger vos inscriptions pour le moment.
            </div>
          ) : registrations.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <CalendarDays className="mx-auto text-[var(--brand-primary)]" size={28} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune inscription</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                Vos prochaines inscriptions apparaîtront ici après réservation.
              </p>
            </div>
          ) : (
          registrations.map((event) => {
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
                    onClick={() => downloadTicket(event)}
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
          })
          )}
        </div>

        <Link to="/agenda" className="mt-6 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
          Retour agenda
        </Link>
    </AccountLayout>
  );
}