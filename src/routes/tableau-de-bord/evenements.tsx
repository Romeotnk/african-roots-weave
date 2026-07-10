import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Copy, Eye, Plus, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { events } from "@/data/events";

export const Route = createFileRoute("/tableau-de-bord/evenements")({
  head: () => ({ meta: [{ title: "Mes evenements - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["researcher", "professional", "admin", "super_admin"]}>
      <EventsDashboard />
    </ProtectedRoute>
  ),
});

type EventStatus = "confirmed" | "pending" | "cancelled";
type LocalEvent = (typeof events)[number] & { localStatus: EventStatus };

const statusLabels: Record<EventStatus, string> = {
  confirmed: "Publie",
  pending: "Brouillon",
  cancelled: "Annule",
};

function EventsDashboard() {
  const [items, setItems] = useState<LocalEvent[]>(events.map((event) => ({ ...event, localStatus: event.status ?? "confirmed" })));
  const [filter, setFilter] = useState<EventStatus | "all">("all");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => items.filter((event) => filter === "all" || event.localStatus === filter), [filter, items]);
  const registeredTotal = items.reduce((sum, event) => sum + (event.registered ?? 0), 0);

  const updateStatus = (id: string, status: EventStatus) => {
    setItems((current) => current.map((event) => (event.id === id ? { ...event, localStatus: status } : event)));
    setMessage(status === "confirmed" ? "Evenement publie en mode test." : status === "cancelled" ? "Evenement annule en mode test." : "Evenement remis en brouillon.");
  };

  const duplicateEvent = (id: string) => {
    const source = items.find((event) => event.id === id);
    if (!source) return;
    setItems((current) => [{ ...source, id: `local-${Date.now()}`, title: `${source.title} - copie`, localStatus: "pending", registered: 0 }, ...current]);
    setMessage("Copie creee en brouillon.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Communaute</p>
              <h1 className="mt-2 text-[32px] md:text-[42px]">Mes evenements</h1>
              <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                Gere les webinaires, salons, ateliers et formations que vous proposez.
              </p>
            </div>
            <Link to="/agenda" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
              <Plus size={17} /> Voir l'agenda
            </Link>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Evenements" value={items.length} icon={Calendar} />
          <StatCard label="Publies" value={items.filter((event) => event.localStatus === "confirmed").length} icon={Eye} />
          <StatCard label="Inscrits" value={registeredTotal} icon={Plus} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["all", "Tous"],
            ["confirmed", "Publies"],
            ["pending", "Brouillons"],
            ["cancelled", "Annules"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`h-10 rounded-full border px-4 text-[13px] font-semibold ${filter === value ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <Calendar className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucun evenement dans ce filtre</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Changez le filtre ou preparez un nouvel evenement.</p>
            </div>
          )}

          {filtered.map((event) => {
            const capacity = event.capacity ?? 0;
            const registered = event.registered ?? 0;
            const fillRate = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
            const isCancelled = event.localStatus === "cancelled";

            return (
              <article key={event.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                  <img src={event.image} alt="" className="aspect-video w-full rounded-[8px] object-cover lg:aspect-square" />
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${isCancelled ? "bg-rose-50 text-rose-700" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"}`}>
                          {statusLabels[event.localStatus]}
                        </span>
                        <h2 className="mt-3 text-[18px] font-bold">{event.title}</h2>
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.date))} - {event.location}
                        </p>
                      </div>
                      <p className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
                        {event.price ? `${event.price.toLocaleString("fr-FR")} ${event.currency ?? "XOF"}` : "Gratuit"}
                      </p>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{event.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-[12px] font-semibold text-[var(--color-text-muted)]">
                        <span>Inscriptions</span><span>{registered}/{capacity || "-"}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[var(--brand-surface-alt)]">
                        <div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${fillRate}%` }} />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link to="/agenda" className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                        <Eye size={15} /> Agenda
                      </Link>
                      <button type="button" onClick={() => updateStatus(event.id, event.localStatus === "confirmed" ? "pending" : "confirmed")} disabled={isCancelled} className="inline-flex h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                        {event.localStatus === "confirmed" ? "Depublier" : "Publier"}
                      </button>
                      <button type="button" onClick={() => duplicateEvent(event.id)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                        <Copy size={15} /> Dupliquer
                      </button>
                      <button type="button" onClick={() => updateStatus(event.id, "cancelled")} disabled={isCancelled} className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <XCircle size={15} /> Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Calendar }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[28px] font-extrabold">{value.toLocaleString("fr-FR")}</p>
    </div>
  );
}