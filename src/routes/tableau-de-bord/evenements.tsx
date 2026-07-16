import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Copy, Eye, Plus, Search, Ticket, XCircle } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { events } from "@/data/events";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/tableau-de-bord/evenements")({
  head: () => ({ meta: [{ title: "Mes événements - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["researcher", "professional", "admin", "super_admin"]}>
      <EventsDashboard />
    </ProtectedRoute>
  ),
});

type EventStatus = "confirmed" | "pending" | "cancelled";
type LocalEvent = EventItem & { localStatus: EventStatus };

type EventForm = {
  title: string;
  category: string;
  date: string;
  location: string;
  capacity: string;
  price: string;
  online: boolean;
};

const emptyEventForm: EventForm = {
  title: "",
  category: "Atelier",
  date: "",
  location: "En ligne",
  capacity: "30",
  price: "0",
  online: true,
};

const statusLabels: Record<EventStatus, string> = {
  confirmed: "Publié",
  pending: "Brouillon",
  cancelled: "Annulé",
};

function EventsDashboard() {
  const [items, setItems] = useState<LocalEvent[]>(events.map((event) => ({ ...event, localStatus: event.status ?? "confirmed" })));
  const [filter, setFilter] = useState<EventStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyEventForm);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((event) => {
      const matchesStatus = filter === "all" || event.localStatus === filter;
      const matchesSearch =
        !normalized ||
        event.title.toLowerCase().includes(normalized) ||
        event.location.toLowerCase().includes(normalized) ||
        (event.category ?? "").toLowerCase().includes(normalized);
      return matchesStatus && matchesSearch;
    });
  }, [filter, items, query]);
  const registeredTotal = items.reduce((sum, event) => sum + (event.registered ?? 0), 0);

  const updateStatus = (id: string, status: EventStatus) => {
    setItems((current) => current.map((event) => (event.id === id ? { ...event, localStatus: status } : event)));
    setMessage(status === "confirmed" ? "Événement publié." : status === "cancelled" ? "Événement annulé." : "Événement remis en brouillon.");
  };

  const duplicateEvent = (id: string) => {
    const source = items.find((event) => event.id === id);
    if (!source) return;
    setItems((current) => [{ ...source, id: `local-${Date.now()}`, title: `${source.title} - copie`, localStatus: "pending", registered: 0 }, ...current]);
    setMessage("Copie créée en brouillon.");
  };

  const createEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const capacity = Number(form.capacity);
    const price = Number(form.price);

    if (title.length < 6) {
      setMessage("Le titre de l'événement doit contenir au moins 6 caractères.");
      return;
    }

    if (!form.date) {
      setMessage("Ajoutez une date avant de créer l'événement.");
      return;
    }

    if (Number.isNaN(capacity) || capacity < 1) {
      setMessage("La capacité doit être supérieure à 0.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setMessage("Le prix doit être un nombre positif ou 0 pour un événement gratuit.");
      return;
    }

    const id = `local-${Date.now()}`;
    setItems((current) => [
      {
        id,
        title,
        type: form.category.toLowerCase().includes("webinaire") ? "WEBINAIRE" : form.category.toLowerCase().includes("formation") ? "FORMATION" : "ATELIER",
        category: form.category.trim() || "Atelier",
        date: new Date(form.date).toISOString(),
        location: form.location.trim() || (form.online ? "En ligne" : "Lieu à confirmer"),
        online: form.online,
        description: "Description à compléter avant publication.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop",
        price,
        currency: "XOF",
        capacity,
        registered: 0,
        status: "pending",
        localStatus: "pending",
      },
      ...current,
    ]);
    setForm(emptyEventForm);
    setShowForm(false);
    setMessage("Événement créé en brouillon. Complétez la description avant publication.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Communauté</p>
              <h1 className="mt-2 text-[32px] md:text-[42px]">Mes événements</h1>
              <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                Gérez les webinaires, salons, ateliers et formations que vous proposez.
              </p>
            </div>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
              <Plus size={17} /> {showForm ? "Fermer" : "Nouvel événement"}
            </button>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Événements" value={items.length} icon={Calendar} />
          <StatCard label="Publiés" value={items.filter((event) => event.localStatus === "confirmed").length} icon={Eye} />
          <StatCard label="Inscrits" value={registeredTotal} icon={Ticket} />
        </div>

        {showForm && (
          <form onSubmit={createEvent} className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-6">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titre de l'événement" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px] md:col-span-2" />
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Catégorie" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input type="datetime-local" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} inputMode="numeric" placeholder="Capacité" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-gold)] px-5 text-[13px] font-bold text-[var(--color-text-primary)]">
                Créer
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px_160px]">
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Lieu" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} inputMode="numeric" placeholder="Prix XOF" className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <label className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                <input type="checkbox" checked={form.online} onChange={(event) => setForm((current) => ({ ...current, online: event.target.checked, location: event.target.checked ? "En ligne" : current.location }))} />
                En ligne
              </label>
            </div>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un événement..." className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {([[
              "all", "Tous"],
              ["confirmed", "Publiés"],
              ["pending", "Brouillons"],
              ["cancelled", "Annulés"],
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
        </div>

        {message && <p className="mt-5 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <Calendar className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">Aucun événement trouvé</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Changez le filtre, la recherche ou préparez un nouvel événement.</p>
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
                        {event.localStatus === "confirmed" ? "Dépublier" : "Publiér"}
                      </button>
                      <button type="button" onClick={() => duplicateEvent(event.id)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                        <Copy size={15} /> Dupliquer
                      </button>
                      <button type="button" onClick={() => updateStatus(event.id, "cancelled")} disabled={isCancelled} className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-[13px] font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <XCircle size={15} /> Annulér
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
