import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { EventCard } from "@/components/shared/EventCard";
import { useEvent, useEvents, useMyRegistrations, useRegisterEvent, useUnregisterEvent } from "@/hooks/useEventsFormationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import { useAuth } from "@/lib/auth/AuthContext";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/agenda/$id")({
  head: () => ({ meta: [{ title: "Événement - IWOSAN" }] }),
  component: EventDetail,
});

type BackendRegistration = { eventId?: string; event?: { id?: string } };

function EventDetail() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { user } = useAuth();
  const eventQuery = useEvent(id);
  const eventsQuery = useEvents();
  const registrationsQuery = useMyRegistrations();
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();
  const [registrationMessage, setRegistrationMessage] = useState("");

  const apiEvent = useMemo(() => toEventItem((eventQuery.data ?? {}) as BackendEvent, t), [eventQuery.data, t]);

  const isRegistered = ((registrationsQuery.data ?? []) as BackendRegistration[]).some(
    (registration) => registration.eventId === id || registration.event?.id === id,
  );

  const toggleRegistration = () => {
    setRegistrationMessage("");
    if (isRegistered) {
      unregisterEvent.mutate(id, {
        onSuccess: () => setRegistrationMessage(t("agenda.detail.unregistered")),
        onError: (error) => setRegistrationMessage(error instanceof Error ? error.message : t("agenda.detail.unregisterError")),
      });
      return;
    }
    registerEvent.mutate(id, {
      onSuccess: () => setRegistrationMessage(t("agenda.detail.registrationConfirmed")),
      onError: (error) => setRegistrationMessage(error instanceof Error ? error.message : t("agenda.detail.registerError")),
    });
  };
  const apiEvents = useMemo(
    () => ((eventsQuery.data?.events ?? []) as BackendEvent[]).map((event) => toEventItem(event, t)).filter((item): item is EventItem => Boolean(item)),
    [eventsQuery.data, t],
  );

  if (eventQuery.isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <p className="text-[14px] text-[var(--color-text-muted)]">{t("agenda.detail.loading")}</p>
      </main>
    );
  }

  if (!apiEvent) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <div>
          <h1 className="text-[28px] font-bold">{t("agenda.detail.notFoundTitle")}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            {t("agenda.detail.notFoundDesc")}
          </p>
          <Link to="/agenda" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white">
            {t("agenda.detail.backToAgenda")}
          </Link>
        </div>
      </main>
    );
  }

  const event = apiEvent;
  const d = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : null;
  const related = apiEvents.filter((item) => item.id !== event.id && item.type === event.type).slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative overflow-hidden bg-[var(--brand-primary-dark)] text-white">
        <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,39,24,.9),rgba(31,90,57,.82))]" />
        <div className="relative container-iwosan py-16 md:py-20">
          <Link to="/agenda" className="text-[13px] font-semibold text-[var(--brand-gold)]">{t("agenda.detail.backToAgenda")}</Link>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/70">{event.type}</p>
              <h1 className="mt-4 max-w-4xl text-[38px] leading-tight text-white md:text-[58px]">{event.title}</h1>
              <p className="mt-4 max-w-2xl text-white/80">{event.description}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-[13px] text-white/75">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><CalendarDays size={15} /> {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Clock3 size={15} /> {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{end ? ` - ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><MapPin size={15} /> {event.location}</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">{t("agenda.detail.quickAccess")}</p>
              <p className="mt-2 text-[20px] font-bold">{t("agenda.detail.bookYourSpot")}</p>
              <div className="mt-4 space-y-3">
                {apiEvent && (
                  user ? (
                    <button
                      type="button"
                      onClick={toggleRegistration}
                      disabled={registerEvent.isPending || unregisterEvent.isPending}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-center font-semibold disabled:opacity-60 ${isRegistered ? "border border-white/30 text-white" : "bg-white text-[var(--brand-primary-dark)]"}`}
                    >
                      {isRegistered && <CheckCircle2 size={17} />}
                      {registerEvent.isPending || unregisterEvent.isPending
                        ? t("agenda.detail.processing")
                        : isRegistered
                          ? t("agenda.detail.registered")
                          : t("agenda.detail.registerCta")}
                    </button>
                  ) : (
                    <Link to="/connexion" className="block rounded-full bg-white px-4 py-3 text-center font-semibold text-[var(--brand-primary-dark)]">
                      {t("agenda.detail.loginToRegister")}
                    </Link>
                  )
                )}
                {registrationMessage && <p className="rounded-lg bg-white/10 px-3 py-2 text-center text-[12px] text-white">{registrationMessage}</p>}
                {event.online && event.meetingUrl && (
                  <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="block rounded-full bg-[var(--brand-gold)] px-4 py-3 text-center font-semibold text-white">{t("agenda.detail.joinVideoConference")}</a>
                )}
                <a href={`https://wa.me/221770000000?text=${encodeURIComponent(t("agenda.detail.whatsappMessage", { title: event.title }))}`} target="_blank" rel="noreferrer" className="block rounded-full bg-[#25D366] px-4 py-3 text-center font-semibold text-white">WhatsApp</a>
                <Link to="/agenda" className="block rounded-full border border-white/20 px-4 py-3 text-center font-semibold text-white">{t("agenda.detail.seeOtherEvents")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {event.program && event.program.length > 0 && (
            <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
              <h2 className="text-[22px] font-bold">{t("agenda.detail.program")}</h2>
              <div className="mt-4 space-y-3">
                {event.program.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-[var(--brand-surface-alt)] p-4">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {event.speakers?.length ? (
            <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
              <h2 className="text-[22px] font-bold">{t("agenda.detail.speakers")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {event.speakers.map((speaker) => (
                  <div key={speaker.name} className="rounded-2xl border border-[var(--brand-border-light)] p-4">
                    <img src={speaker.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                    <p className="mt-3 font-bold">{speaker.name}</p>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{speaker.bio}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {related.length > 0 && (
            <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
              <h2 className="text-[22px] font-bold">{t("agenda.detail.similarEvents")}</h2>
              <div className="mt-4 space-y-4">
                {related.map((item) => <EventCard key={item.id} event={item} actionLabel={t("agenda.detail.seeAction")} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">{t("agenda.detail.practicalInfo")}</p>
          <div className="mt-4 space-y-3 text-[14px] text-[var(--color-text-secondary)]">
            <p><strong>{t("agenda.detail.location")}</strong> {event.location}</p>
            {event.address && <p><strong>{t("agenda.detail.address")}</strong> {event.address}</p>}
            <p><strong>{t("agenda.detail.format")}</strong> {event.online ? t("agenda.detail.online") : t("agenda.detail.inPerson")}</p>
            <p><strong>{t("agenda.detail.status")}</strong> {event.status}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
