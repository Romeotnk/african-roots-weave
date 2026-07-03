import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, List, MapPin, X } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { EventCard } from "@/components/shared/EventCard";
import { events } from "@/data/events";
import { useEvents } from "@/hooks/useEventsFormationsApi";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda & Evenements - IWOSAN" }] }),
  component: Agenda,
});

const filters = ["Tous", "WEBINAIRE", "FORMATION", "SALON", "CONFERENCE", "ATELIER"];
const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const fallbackEventImage = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop";

type BackendEvent = {
  id?: string;
  title?: string;
  description?: string;
  type?: EventItem["type"];
  startDate?: string;
  endDate?: string;
  location?: string | null;
  isOnline?: boolean;
  maxAttendees?: number | null;
  coverImage?: string | null;
  registrations?: unknown[];
};

function toEventItem(event: BackendEvent): EventItem | null {
  if (!event.id || !event.title || !event.startDate) return null;
  return {
    id: event.id,
    title: event.title,
    type: event.type ?? "CONFERENCE",
    category: event.type ? event.type.toLowerCase() : "Evenement",
    date: event.startDate,
    endDate: event.endDate,
    location: event.isOnline ? "En ligne" : event.location ?? "Lieu a confirmer",
    online: Boolean(event.isOnline),
    description: event.description ?? "Details a venir.",
    image: event.coverImage ?? fallbackEventImage,
    capacity: event.maxAttendees ?? undefined,
    registered: event.registrations?.length,
    status: "confirmed",
  };
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: last.getDate() }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1)),
  ];
}

function Agenda() {
  const eventsQuery = useEvents();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState("Tous");
  const [month, setMonth] = useState(new Date("2026-06-15T12:00:00"));
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registered, setRegistered] = useState(false);
  const apiEvents = useMemo(
    () => ((eventsQuery.data?.events ?? []) as BackendEvent[]).map(toEventItem).filter(Boolean) as EventItem[],
    [eventsQuery.data],
  );
  const eventList = apiEvents.length > 0 ? apiEvents : events;

  const filteredEvents = useMemo(
    () => eventList.filter((event) => filter === "Tous" || event.type === filter).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [eventList, filter],
  );

  const days = monthDays(month);

  return (
    <>
      <HeroSection
        image="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80"
        badge="Agenda"
        title="Agenda & Evenements"
        subtitle="Webinaires, formations, salons et ateliers partout en Afrique et en ligne."
        size="md"
      />
      <section className="py-12">
        <div className="container-iwosan">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold ${filter === item ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)] bg-white"}`}
                >
                  {item === "Tous" ? "Tous" : item.toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex rounded-full border border-[var(--brand-border)] bg-white p-1">
              <button onClick={() => setView("calendar")} className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold ${view === "calendar" ? "bg-[var(--brand-primary)] text-white" : ""}`}>
                <CalendarDays size={14} /> Calendrier
              </button>
              <button onClick={() => setView("list")} className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold ${view === "list" ? "bg-[var(--brand-primary)] text-white" : ""}`}>
                <List size={14} /> Liste
              </button>
            </div>
          </div>

          {view === "calendar" ? (
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]"><ChevronLeft size={18} /></button>
                <h2 className="text-[24px] font-bold capitalize">{month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</h2>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-bold text-[var(--color-text-muted)]">
                {weekdays.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = day ? filteredEvents.filter((event) => sameDay(new Date(event.date), day)) : [];
                  const isToday = day ? sameDay(day, new Date("2026-06-15T12:00:00")) : false;
                  return (
                    <button
                      key={index}
                      disabled={!day}
                      onClick={() => dayEvents[0] && setSelectedEvent(dayEvents[0])}
                      className={`group relative min-h-24 rounded-lg border p-2 text-left ${isToday ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border-light)] bg-[var(--brand-bg)]"} ${dayEvents.length ? "hover:border-red-500" : ""}`}
                    >
                      {day && (
                        <>
                          <span className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold ${dayEvents.length ? "border-2 border-red-500 text-red-600" : ""}`}>
                            {day.getDate()}
                          </span>
                          {dayEvents.length > 0 && <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">{dayEvents.length}</span>}
                          {dayEvents.length > 0 && (
                            <div className="pointer-events-none absolute left-2 right-2 top-12 z-10 hidden rounded-lg border border-[var(--brand-border)] bg-white p-3 text-[12px] shadow-iwosan-md group-hover:block">
                              {dayEvents.map((event) => (
                                <p key={event.id} className="line-clamp-2 font-semibold">{new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {event.title}</p>
                              ))}
                              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Cliquez pour voir les details</p>
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setView("list")} className="mt-5 h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                Voir tous les evenements du mois
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Evenements a venir</h3>
              {filteredEvents.map((event) => (
                <button key={event.id} onClick={() => setSelectedEvent(event)} className="block w-full text-left">
                  <EventCard event={event} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedEvent && (
        <div className="fixed inset-0 z-[80] bg-black/50 p-4">
          <div className="ml-auto h-full max-w-xl overflow-y-auto rounded-[12px] bg-white p-5 shadow-iwosan-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold">{selectedEvent.title}</h2>
              <button onClick={() => { setSelectedEvent(null); setRegistered(false); }}><X size={20} /></button>
            </div>
            <img src={selectedEvent.image} alt="" className="mt-4 aspect-video w-full rounded-lg object-cover" />
            <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
              <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[var(--brand-primary)]">{selectedEvent.type}</span>
              <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1">{selectedEvent.category}</span>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{selectedEvent.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-[14px]"><MapPin size={15} /> {selectedEvent.online ? "En ligne" : `${selectedEvent.location} - ${selectedEvent.address ?? ""}`}</p>
            <div className="mt-5 space-y-2">
              {(selectedEvent.program ?? []).map((item) => (
                <details key={item.title} className="rounded-lg bg-[var(--brand-surface-alt)] p-3">
                  <summary className="cursor-pointer font-semibold">{item.title}</summary>
                  <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">{item.detail}</p>
                </details>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {(selectedEvent.speakers ?? []).map((speaker) => (
                <div key={speaker.name} className="flex gap-3 rounded-lg border border-[var(--brand-border)] p-3">
                  <img src={speaker.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div><p className="font-bold">{speaker.name}</p><p className="text-[13px] text-[var(--color-text-muted)]">{speaker.bio}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
              <p className="font-bold">{selectedEvent.price ? `${selectedEvent.price.toLocaleString("fr-FR")} ${selectedEvent.currency}` : "Gratuit"}</p>
              <p className="mt-1">{(selectedEvent.capacity ?? 0) - (selectedEvent.registered ?? 0)} places restantes sur {selectedEvent.capacity}</p>
              <div className="mt-2 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${((selectedEvent.registered ?? 0) / (selectedEvent.capacity ?? 1)) * 100}%` }} /></div>
            </div>
            <button onClick={() => setRegistered(true)} className="mt-5 h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white">S'inscrire a cet evenement</button>
            {registered && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">Inscription enregistree en mock.</p>}
            <Link to="/dashboard/inscriptions" className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">Voir mes inscriptions</Link>
          </div>
        </div>
      )}
    </>
  );
}
