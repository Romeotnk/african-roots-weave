import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Eye, Loader2, Plus, Search, Ticket, XCircle } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useCreateEvent, useMyEvents, useUpdateEvent } from "@/hooks/useEventsFormationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/tableau-de-bord/evenements")({
  head: () => ({ meta: [{ title: "Mes événements - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
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
  meetingUrl: string;
};

const emptyEventForm: EventForm = {
  title: "",
  category: "WEBINAR",
  date: "",
  location: "En ligne",
  capacity: "30",
  price: "0",
  online: true,
  meetingUrl: "",
};

function EventsDashboard() {
  const { t } = useTranslation();
  const eventTypeOptions = [
    { value: "WEBINAR", label: t("dashboard.myEvents.typeWebinar") },
    { value: "FORMATION", label: t("dashboard.myEvents.typeFormation") },
    { value: "SALON", label: t("dashboard.myEvents.typeSalon") },
    { value: "PORTES_OUVERTES", label: t("dashboard.myEvents.typePortesOuvertes") },
    { value: "LANCEMENT_PRODUIT", label: t("dashboard.myEvents.typeLancementProduit") },
  ] as const;
  const statusLabels: Record<EventStatus, string> = {
    confirmed: t("dashboard.myEvents.statusConfirmed"),
    pending: t("dashboard.myEvents.statusPending"),
    cancelled: t("dashboard.myEvents.statusCancelled"),
  };
  const myEventsQuery = useMyEvents();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const items: LocalEvent[] = useMemo(
    () =>
      ((myEventsQuery.data?.events ?? []) as (BackendEvent & { isPublished?: boolean })[])
        .map((event) => {
          const item = toEventItem(event, t);
          return item ? { ...item, localStatus: (event.isPublished ? "confirmed" : "pending") as EventStatus } : null;
        })
        .filter((item): item is LocalEvent => Boolean(item)),
    [myEventsQuery.data, t],
  );

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
    updateEventMutation.mutate(
      { id, payload: { isPublished: status === "confirmed" } },
      {
        onSuccess: (updated) => {
          // The server silently keeps isPublished:false for professional
          // accounts (only SUPER_ADMIN/ADMIN can truly publish) — read the
          // record it actually persisted instead of assuming the request succeeded
          // as-requested, so this message never claims "published" when it isn't.
          const actuallyPublished = Boolean((updated as { isPublished?: boolean } | null)?.isPublished);
          setMessage(
            status === "confirmed" && !actuallyPublished
              ? t("dashboard.myEvents.submittedForReview")
              : actuallyPublished
                ? t("dashboard.myEvents.published")
                : t("dashboard.myEvents.unpublished"),
          );
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myEvents.actionError")),
      },
    );
  };

  const createEvent = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const title = form.title.trim();
    const capacity = Number(form.capacity);
    const price = Number(form.price);

    if (title.length < 6) {
      setMessage(t("dashboard.myEvents.titleTooShort"));
      return;
    }

    if (!form.date) {
      setMessage(t("dashboard.myEvents.dateRequired"));
      return;
    }

    if (Number.isNaN(capacity) || capacity < 1) {
      setMessage(t("dashboard.myEvents.capacityInvalid"));
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setMessage(t("dashboard.myEvents.priceInvalid"));
      return;
    }

    const startDate = new Date(form.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    createEventMutation.mutate(
      {
        title,
        type: form.category,
        description: t("dashboard.myEvents.defaultDescription"),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: form.online ? undefined : form.location.trim() || t("dashboard.myEvents.defaultLocation"),
        isOnline: form.online,
        meetingUrl: form.online ? form.meetingUrl.trim() || undefined : undefined,
        maxAttendees: capacity,
        isPublished: false,
      },
      {
        onSuccess: () => {
          setForm(emptyEventForm);
          setShowForm(false);
          setMessage(t("dashboard.myEvents.created"));
        },
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.myEvents.createError")),
      },
    );
  };

  return (
    <AccountLayout
      title={t("dashboard.myEvents.title")}
      description={t("dashboard.myEvents.description")}
      actions={
        <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white">
          <Plus size={17} /> {showForm ? t("dashboard.myEvents.close") : t("dashboard.myEvents.newEvent")}
        </button>
      }
    >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label={t("dashboard.myEvents.statEvents")} value={items.length} icon={Calendar} />
          <StatCard label={t("dashboard.myEvents.statPublished")} value={items.filter((event) => event.localStatus === "confirmed").length} icon={Eye} />
          <StatCard label={t("dashboard.myEvents.statRegistered")} value={registeredTotal} icon={Ticket} />
        </div>

        {showForm && (
          <form onSubmit={createEvent} className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-6">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={t("dashboard.myEvents.titlePlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px] md:col-span-2" />
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] bg-white px-4 text-[14px]">
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input type="datetime-local" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} inputMode="numeric" placeholder={t("dashboard.myEvents.capacityPlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-gold)] px-5 text-[13px] font-bold text-[var(--color-text-primary)]">
                {t("dashboard.myEvents.create")}
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px_160px]">
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder={t("dashboard.myEvents.locationPlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} inputMode="numeric" placeholder={t("dashboard.myEvents.pricePlaceholder")} className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]" />
              <label className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                <input type="checkbox" checked={form.online} onChange={(event) => setForm((current) => ({ ...current, online: event.target.checked, location: event.target.checked ? t("dashboard.myEvents.online") : current.location }))} />
                {t("dashboard.myEvents.online")}
              </label>
            </div>
            {form.online && (
              <input
                type="url"
                value={form.meetingUrl}
                onChange={(event) => setForm((current) => ({ ...current, meetingUrl: event.target.value }))}
                placeholder={t("dashboard.myEvents.meetingUrlPlaceholder")}
                className="mt-4 h-11 w-full rounded-[8px] border border-[var(--brand-border)] px-4 text-[14px]"
              />
            )}
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("dashboard.myEvents.searchPlaceholder")} className="h-10 w-full rounded-full border border-[var(--brand-border)] bg-white pl-10 pr-4 text-[13px]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {([[
              "all", t("dashboard.myEvents.all")],
              ["confirmed", t("dashboard.myEvents.filterPublished")],
              ["pending", t("dashboard.myEvents.filterDrafts")],
              ["cancelled", t("dashboard.myEvents.filterCancelled")],
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
          {myEventsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : myEventsQuery.isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              {t("dashboard.myEvents.loadError")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <Calendar className="mx-auto text-[var(--brand-primary)]" size={32} />
              <h2 className="mt-3 text-[20px] font-bold">{t("dashboard.myEvents.emptyTitle")}</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.myEvents.emptyDesc")}</p>
            </div>
          ) : (
          filtered.map((event) => {
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
                        {event.price ? `${event.price.toLocaleString("fr-FR")} ${event.currency ?? "XOF"}` : t("dashboard.myEvents.free")}
                      </p>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[14px] text-[var(--color-text-secondary)]">{event.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-[12px] font-semibold text-[var(--color-text-muted)]">
                        <span>{t("dashboard.myEvents.registrations")}</span><span>{registered}/{capacity || "-"}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[var(--brand-surface-alt)]">
                        <div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${fillRate}%` }} />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link to="/agenda" className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                        <Eye size={15} /> {t("dashboard.myEvents.agenda")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => updateStatus(event.id, event.localStatus === "confirmed" ? "pending" : "confirmed")}
                        disabled={isCancelled || updateEventMutation.isPending}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {event.localStatus === "confirmed" ? <><XCircle size={15} /> {t("dashboard.myEvents.unpublish")}</> : t("dashboard.myEvents.publish")}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
          )}
        </div>
    </AccountLayout>
  );
}

