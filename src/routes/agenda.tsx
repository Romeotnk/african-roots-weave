import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { EventCard } from "@/components/shared/EventCard";
import { events } from "@/data/events";
import { useEvents } from "@/hooks/useEventsFormationsApi";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda & Événements - IWOSAN" }] }),
  component: Agenda,
});

const filters = ["Tous", "WEBINAIRE", "FORMATION", "SALON", "CONFERENCE", "ATELIER"];
const fallbackEventImage = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop";

function monthDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  return [...Array.from({ length: offset }, () => null), ...Array.from({ length: last.getDate() }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1))];
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function Agenda() {
  const eventsQuery = useEvents();
  const [filter, setFilter] = useState("Tous");
  const [month, setMonth] = useState(new Date("2026-07-01T12:00:00"));
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date("2026-07-19T14:32:00"));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const apiEvents = useMemo(
    () => ((eventsQuery.data?.events ?? []) as any[])
      .map((event) => event?.id && event?.title && event?.startDate ? {
        id: event.id,
        title: event.title,
        type: event.type ?? "CONFERENCE",
        category: event.type ? String(event.type).toLowerCase() : "Evenement",
        date: event.startDate,
        endDate: event.endDate,
        location: event.isOnline ? "En ligne" : event.location ?? "Lieu à confirmer",
        online: Boolean(event.isOnline),
        description: event.description ?? "Détails à venir.",
        image: event.coverImage ?? fallbackEventImage,
        capacity: event.maxAttendees ?? undefined,
        registered: event.registrations?.length,
        status: "confirmed",
      } : null)
      .filter(Boolean) as EventItem[],
    [eventsQuery.data],
  );

  const eventList = apiEvents.length > 0 ? apiEvents : events;
  const filteredEvents = useMemo(() => eventList.filter((event) => filter === "Tous" || event.type === filter).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [eventList, filter]);
  const days = monthDays(month);
  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    filteredEvents.forEach((event) => {
      const key = new Date(event.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return [...map.entries()];
  }, [filteredEvents]);
  const selectedDayEvents = selectedDay ? filteredEvents.filter((event) => sameDay(new Date(event.date), selectedDay)) : [];

  return (
    <>
      <HeroSection image="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80" badge="Agenda" title="Agenda & Événements" subtitle="Vue par défaut en liste, avec calendrier latéral optionnel." size="md" />
      <section className="container-iwosan py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${filter === item ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)] bg-white"}`}>{item === "Tous" ? "Tous" : item.toLowerCase()}</button>)}</div>
          <button onClick={() => setPanelOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"><CalendarDays size={15} /> Calendrier</button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-7">
            <div className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-terracotta)]">DATE ACTUELLE</p>
              <h2 className="mt-2 text-[28px]">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</h2>
            </div>
            {grouped.map(([monthLabel, items]) => (
              <section key={monthLabel}>
                <h3 className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{monthLabel}</h3>
                <div className="space-y-4">{items.map((event) => <EventCard key={event.id} event={event} actionLabel="S'inscrire" />)}</div>
              </section>
            ))}
          </div>
          <aside className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 lg:sticky lg:top-24 h-fit">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Calendrier</h2>
              <button onClick={() => setPanelOpen(false)} className="rounded-full p-2 text-[var(--color-text-muted)] lg:hidden"><X size={18} /></button>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full border"><ChevronLeft size={16} /></button>
              <p className="font-semibold capitalize">{month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-full border"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--color-text-muted)]">{["L","M","M","J","V","S","D"].map((d) => <div key={d}>{d}</div>)}</div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const eventsForDay = day ? filteredEvents.filter((event) => sameDay(new Date(event.date), day)) : [];
                return (
                  <button key={index} disabled={!day} onClick={() => setSelectedDay(day ?? null)} className={`min-h-12 rounded-lg border text-[12px] ${day ? "bg-white" : "bg-transparent border-transparent"} ${eventsForDay.length ? "border-[var(--brand-gold)]" : "border-[var(--brand-border-light)]"}`}>
                    {day && <div className="flex h-full flex-col items-center justify-center"><span>{day.getDate()}</span>{eventsForDay.length > 0 && <span className="mt-1 h-2 w-2 rounded-full bg-[var(--brand-gold)]" />}</div>}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl bg-[var(--brand-surface-alt)] p-4 text-[13px]">
              <p className="font-semibold">{selectedDay ? selectedDay.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "Cliquez un jour"}</p>
              {selectedDayEvents.map((event) => <p key={event.id} className="mt-2">• {event.title}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <div className={`fixed inset-0 z-[100] ${panelOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity ${panelOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setPanelOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-[300px] bg-white p-5 shadow-2xl transition-transform ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Calendrier</h2><button onClick={() => setPanelOpen(false)}><X size={18} /></button></div>
          <p className="mb-4 text-[13px] text-[var(--color-text-muted)]">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          <div className="space-y-3">{filteredEvents.slice(0, 6).map((event) => <EventCard key={event.id} event={event} actionLabel="S'inscrire" />)}</div>
        </aside>
      </div>
    </>
  );
}
