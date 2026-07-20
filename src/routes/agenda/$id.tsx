import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { EventCard } from "@/components/shared/EventCard";
import { events } from "@/data/events";

export const Route = createFileRoute("/agenda/$id")({
  head: () => ({ meta: [{ title: "Événement - IWOSAN" }] }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const event = events.find((item) => item.id === id) ?? events[0];
  const d = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : null;
  const related = events.filter((item) => item.id !== event.id && item.type === event.type).slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative overflow-hidden bg-[var(--brand-primary-dark)] text-white">
        <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,39,24,.9),rgba(31,90,57,.82))]" />
        <div className="relative container-iwosan py-16 md:py-20">
          <Link to="/agenda" className="text-[13px] font-semibold text-[var(--brand-gold)]">Retour à l'agenda</Link>
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
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">Accès rapide</p>
              <p className="mt-2 text-[20px] font-bold">Réserver votre place</p>
              <div className="mt-4 space-y-3">
                <a href={`https://wa.me/22900000000?text=${encodeURIComponent(`Bonjour, je souhaite réserver une place pour ${event.title}`)}`} target="_blank" rel="noreferrer" className="block rounded-full bg-[#25D366] px-4 py-3 text-center font-semibold text-white">WhatsApp</a>
                <Link to="/agenda" className="block rounded-full border border-white/20 px-4 py-3 text-center font-semibold text-white">Voir les autres événements</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
            <h2 className="text-[22px] font-bold">Programme</h2>
            <div className="mt-4 space-y-3">
              {(event.program ?? []).map((item) => (
                <div key={item.title} className="rounded-2xl bg-[var(--brand-surface-alt)] p-4">
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {event.speakers?.length ? (
            <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
              <h2 className="text-[22px] font-bold">Intervenants</h2>
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

          <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-7">
            <h2 className="text-[22px] font-bold">Événements similaires</h2>
            <div className="mt-4 space-y-4">
              {related.map((item) => <EventCard key={item.id} event={item} actionLabel="Voir" />)}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">Infos pratiques</p>
          <div className="mt-4 space-y-3 text-[14px] text-[var(--color-text-secondary)]">
            <p><strong>Lieu:</strong> {event.location}</p>
            {event.address && <p><strong>Adresse:</strong> {event.address}</p>}
            <p><strong>Format:</strong> {event.online ? "En ligne" : "Présentiel"}</p>
            <p><strong>Statut:</strong> {event.status}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
