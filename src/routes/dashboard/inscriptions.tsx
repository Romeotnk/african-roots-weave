import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteRedirect } from "@/components/RouteRedirect";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useMeQuery } from "@/hooks/useAuthApi";
import { useMyRegistrations, useUnregisterEvent } from "@/hooks/useEventsFormationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/dashboard/inscriptions")({
  head: () => ({ meta: [{ title: "Mes inscriptions - IWOSAN" }] }),
  component: DashboardInscriptionsRedirect,
});

function DashboardInscriptionsRedirect() {
  const { t } = useTranslation();
  return <RouteRedirect to="/mon-compte/inscriptions" label={t("routeRedirect.openingRegistrations")} />;
}

type Registration = EventItem & { localStatus: "confirmed" | "pending" | "cancelled" };

type BackendRegistration = { eventId?: string; event?: BackendEvent };

export function Registrations() {
  const { t } = useTranslation();
  const registrationsQuery = useMyRegistrations();
  const unregister = useUnregisterEvent();
  const { data: profile } = useMeQuery();
  // Cancelling actually deletes the EventRegistration server-side, so the
  // refetch this mutation triggers makes the row vanish from the API
  // response entirely — keep a local copy of what was just cancelled so it
  // stays visible with an "Annulé" badge instead of silently disappearing.
  const [cancelledEvents, setCancelledEvents] = useState<Registration[]>([]);
  const [actionMessage, setActionMessage] = useState("");

  const registrations = useMemo(() => {
    const fromApi = ((registrationsQuery.data ?? []) as BackendRegistration[])
      .map((registration) => (registration.event ? toEventItem(registration.event, t) : null))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((event): Registration => ({ ...event, localStatus: "confirmed" }));
    const cancelledIds = new Set(cancelledEvents.map((event) => event.id));
    return [...fromApi.filter((event) => !cancelledIds.has(event.id)), ...cancelledEvents];
  }, [registrationsQuery.data, cancelledEvents, t]);

  const cancelRegistration = (id: string) => {
    const target = registrations.find((event) => event.id === id);
    unregister.mutate(id, {
      onSuccess: () => {
        if (target) setCancelledEvents((current) => [...current, { ...target, localStatus: "cancelled" }]);
        setActionMessage(t("account.registrations.cancelSuccess"));
      },
      onError: (error) => {
        setActionMessage(error instanceof Error ? error.message : t("account.registrations.cancelError"));
      },
    });
  };

  // This generates a plain-text summary from data already in memory — not an
  // official, server-issued ticket (no verification, no QR code) — so the
  // label calls it an "attestation" rather than a "billet" to avoid implying
  // otherwise.
  const downloadAttestation = (event: Registration) => {
    const lines = [
      t("account.registrations.attestationHeader"),
      "",
      t("account.registrations.attestationEvent", { title: event.title }),
      t("account.registrations.attestationDate", { date: new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date(event.date)) }),
      t("account.registrations.attestationLocation", { location: event.online ? t("account.registrations.onlineParticipation") : (event.address ?? event.location) }),
      t("account.registrations.attestationParticipant", { name: profile ? `${profile.firstName} ${profile.lastName}` : t("account.registrations.defaultAccountLabel") }),
      t("account.registrations.attestationReference", { id: event.id }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attestation-${event.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setActionMessage(t("account.registrations.attestationDownloaded", { title: event.title }));
  };

  return (
    <AccountLayout
      title={t("account.registrations.title")}
      description={t("account.registrations.description")}
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
              {t("account.registrations.loadError")}
            </div>
          ) : registrations.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <CalendarDays className="mx-auto text-[var(--brand-primary)]" size={28} />
              <h2 className="mt-3 text-[20px] font-bold">{t("account.registrations.emptyTitle")}</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                {t("account.registrations.emptyDesc")}
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
                      {event.online ? t("account.registrations.onlineParticipation") : event.address ?? t("account.registrations.addressToConfirm")}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${isCancelled ? "bg-rose-50 text-rose-700" : "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"}`}>
                    {event.localStatus === "pending" ? t("account.registrations.pending") : isCancelled ? t("account.registrations.cancelled") : t("account.registrations.confirmed")}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/agenda" className="inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                    {t("account.registrations.viewAgenda")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => downloadAttestation(event)}
                    disabled={isCancelled}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={15} /> {t("account.registrations.attestation")}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelRegistration(event.id)}
                    disabled={isCancelled}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle size={15} /> {t("account.registrations.cancel")}
                  </button>
                </div>
              </article>
            );
          })
          )}
        </div>

        <Link to="/agenda" className="mt-6 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
          {t("account.registrations.backToAgenda")}
        </Link>
    </AccountLayout>
  );
}