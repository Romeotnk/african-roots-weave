import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Calendar, CheckCircle2, Clock, Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBookingsApi";
import type { Booking, BookingStatus } from "@/lib/api/bookings";

const statusClasses: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function ReservationsPage() {
  const { t } = useTranslation();
  const statusLabels: Record<BookingStatus, string> = {
    PENDING: t("dashboard.proBookings.statusPending"),
    CONFIRMED: t("dashboard.proBookings.statusConfirmed"),
    CANCELLED: t("dashboard.proBookings.statusCancelled"),
    COMPLETED: t("dashboard.proBookings.statusCompleted"),
  };
  const { data: bookings, isLoading, isError } = useMyBookings("professional");
  const updateStatus = useUpdateBookingStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const list = bookings ?? [];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return list.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const clientName = `${booking.client.firstName} ${booking.client.lastName}`.toLowerCase();
      const matchesQuery = !normalized || clientName.includes(normalized) || booking.serviceName.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [list, statusFilter, query]);

  const pendingCount = list.filter((booking) => booking.status === "PENDING").length;
  const confirmedCount = list.filter((booking) => booking.status === "CONFIRMED").length;

  const act = (booking: Booking, status: BookingStatus) => {
    setMessage("");
    updateStatus.mutate(
      { id: booking.id, status },
      {
        onSuccess: () => setMessage(t("dashboard.proBookings.actionSuccess", { status: statusLabels[status].toLowerCase() })),
        onError: (error) => setMessage(error instanceof Error ? error.message : t("dashboard.proBookings.actionError")),
      },
    );
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout
        title={t("dashboard.proBookings.title")}
        description={t("dashboard.proBookings.description")}
      >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Clock} label={t("dashboard.proBookings.pending")} value={String(pendingCount)} />
            <StatCard icon={CheckCircle2} label={t("dashboard.proBookings.confirmed")} value={String(confirmedCount)} />
            <StatCard icon={Calendar} label={t("dashboard.proBookings.total")} value={String(list.length)} />
          </div>

          <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("dashboard.proBookings.searchPlaceholder")}
                  className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                      statusFilter === status
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {status === "all" ? t("dashboard.proBookings.all") : statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
            {message && <p className="mt-3 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
              </div>
            ) : isError ? (
              <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                {t("dashboard.proBookings.loadError")}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
                <Calendar className="mx-auto text-[var(--brand-primary)]" size={34} />
                <h2 className="mt-4 text-[20px] font-bold">{t("dashboard.proBookings.emptyTitle")}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.proBookings.emptyDesc")}</p>
              </div>
            ) : (
              filtered.map((booking) => (
                <article key={booking.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{booking.serviceName}</h2>
                        <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        {booking.client.firstName} {booking.client.lastName} · {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
                      </p>
                      {booking.notes && <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">{booking.notes}</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.status === "PENDING" && (
                      <>
                        <button type="button" onClick={() => act(booking, "CONFIRMED")} disabled={updateStatus.isPending} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50">
                          <CheckCircle2 size={16} /> {t("dashboard.proBookings.confirm")}
                        </button>
                        <button type="button" onClick={() => act(booking, "CANCELLED")} disabled={updateStatus.isPending} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 disabled:opacity-50">
                          <X size={16} /> {t("dashboard.proBookings.decline")}
                        </button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <>
                        <button type="button" onClick={() => act(booking, "COMPLETED")} disabled={updateStatus.isPending} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-50">
                          <CheckCircle2 size={16} /> {t("dashboard.proBookings.markCompleted")}
                        </button>
                        <button type="button" onClick={() => act(booking, "CANCELLED")} disabled={updateStatus.isPending} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 disabled:opacity-50">
                          <X size={16} /> {t("dashboard.proBookings.cancel")}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/reservations")({
  head: () => ({ meta: [{ title: "Réservations - IWOSAN" }] }),
  component: ReservationsPage,
});
