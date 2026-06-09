import type { EventItem } from "@/types";
import { MapPin, Wifi } from "lucide-react";

const typeColors: Record<string, string> = {
  WEBINAIRE: "bg-blue-50 text-blue-700",
  FORMATION: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  SALON: "bg-amber-50 text-amber-700",
};

export function EventCard({ event }: { event: EventItem }) {
  const d = new Date(event.date);
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase();
  return (
    <article className="bg-white rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm card-hover overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-[140px] shrink-0 bg-[var(--brand-primary-subtle)] flex md:flex-col items-center justify-center py-4 md:py-6 gap-3 md:gap-0">
          <span className="text-[32px] md:text-[40px] font-extrabold text-[var(--brand-primary)] leading-none">
            {day}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-primary)]">
            {month}
          </span>
        </div>
        <div className="flex-1 p-5">
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded ${typeColors[event.type]}`}
          >
            {event.type}
          </span>
          <h3 className="mt-2 text-[16px] font-semibold leading-snug line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)] line-clamp-2">
            {event.description}
          </p>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
              {event.online ? <Wifi size={12} /> : <MapPin size={12} />} {event.location}
            </span>
            <button className="text-[12px] font-semibold text-[var(--brand-primary)] hover:underline">
              S'inscrire →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
