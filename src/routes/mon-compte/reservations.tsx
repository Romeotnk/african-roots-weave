import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBookingsApi";
import type { BookingStatus } from "@/lib/api/bookings";

export const Route = createFileRoute("/mon-compte/reservations")({
  head: () => ({ meta: [{ title: "Mes réservations - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <ReservationsPage />
    </ProtectedRoute>
  ),
});

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
  const { data: bookings, isLoading, isError } = useMyBookings("client");
  const updateStatus = useUpdateBookingStatus();
  const list = bookings ?? [];

  const statusLabels: Record<BookingStatus, string> = {
    PENDING: t("account.bookings.statusPending"),
    CONFIRMED: t("account.bookings.statusConfirmed"),
    CANCELLED: t("account.bookings.statusCancelled"),
    COMPLETED: t("account.bookings.statusCompleted"),
  };

  return (
    <AccountLayout
      title={t("account.bookings.title")}
      description={t("account.bookings.description")}
    >
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              {t("account.bookings.loadError")}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
              <Calendar className="mx-auto text-[var(--brand-primary)]" size={34} />
              <h2 className="mt-4 text-[20px] font-bold">{t("account.bookings.emptyTitle")}</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                {t("account.bookings.emptyDesc")}
              </p>
            </div>
          ) : (
            list.map((booking) => (
              <article key={booking.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{booking.serviceName}</h2>
                  <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  {t("account.bookings.withProfessional", {
                    name: booking.professional.professionalProfile?.displayName ?? `${booking.professional.firstName} ${booking.professional.lastName}`,
                    date: formatDateTime(booking.scheduledAt),
                    duration: booking.durationMinutes,
                  })}
                </p>
                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: booking.id, status: "CANCELLED" })}
                    disabled={updateStatus.isPending}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 disabled:opacity-50"
                  >
                    <X size={16} /> {t("account.bookings.cancelRequest")}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
    </AccountLayout>
  );
}
