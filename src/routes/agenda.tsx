import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/shared/HeroSection";
import { EventCard } from "@/components/shared/EventCard";
import { events } from "@/data/events";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda & Événements — IWOSAN" }] }),
  component: Agenda,
});

function Agenda() {
  return (
    <>
      <HeroSection image="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80" badge="📅 Agenda" title="Agenda & Événements" subtitle="Webinaires, formations, salons et portes ouvertes partout en Afrique et en ligne." size="md" />
      <section className="py-12">
        <div className="container-iwosan">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <div className="flex gap-2 flex-wrap">
              {["Tous","Webinaires","Formations","Salons","Portes ouvertes"].map((f,i)=>(
                <button key={f} className={`px-4 py-2 rounded-full text-[13px] font-semibold ${i===0?"bg-[var(--brand-primary)] text-white":"bg-white border border-[var(--brand-border)]"}`}>{f}</button>
              ))}
            </div>
            <div className="flex bg-white border border-[var(--brand-border)] rounded-full p-1">
              <button className="px-4 py-1.5 rounded-full bg-[var(--brand-primary)] text-white text-[13px] font-semibold">Liste</button>
              <button className="px-4 py-1.5 text-[13px] font-semibold text-[var(--color-text-secondary)]">Calendrier</button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[12px] uppercase tracking-[0.12em] font-bold text-[var(--color-text-muted)] mt-2">Juin 2026</h3>
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      </section>
    </>
  );
}
