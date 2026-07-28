import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Loader2, X } from "lucide-react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
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

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

const statusClasses: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function ReservationsPage() {
  const { data: bookings, isLoading, isError } = useMyBookings("client");
  const updateStatus = useUpdateBookingStatus();
  const list = bookings ?? [];

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <div className="mt-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Mon compte</p>
            <h1 className="mt-2 text-[32px] md:text-[42px]">Mes réservations</h1>
            <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
              Suivez vos demandes de réservation de services auprès des professionnels.
            </p>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger vos réservations pour le moment.
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
              <Calendar className="mx-auto text-[var(--brand-primary)]" size={34} />
              <h2 className="mt-4 text-[20px] font-bold">Aucune réservation</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Rendez-vous sur la fiche d'un professionnel pour réserver un service.
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
                  Avec {booking.professional.professionalProfile?.displayName ?? `${booking.professional.firstName} ${booking.professional.lastName}`} · {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
                </p>
                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: booking.id, status: "CANCELLED" })}
                    disabled={updateStatus.isPending}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 disabled:opacity-50"
                  >
                    <X size={16} /> Annuler ma demande
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
