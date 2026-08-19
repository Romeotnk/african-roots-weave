import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CalendarClock, Loader2 } from "lucide-react";
import { useAvailability, useCreateBooking } from "@/hooks/useBookingsApi";
import { useAuth } from "@/lib/auth/AuthContext";

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export function BookingWidget({ professionalId, professionalName }: { professionalId: string; professionalName: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => toDateInputValue(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)), []);
  const [date, setDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("Consultation");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availabilityQuery = useAvailability(professionalId, date);
  const createBooking = useCreateBooking();
  const slots = availabilityQuery.data ?? [];

  const submitBooking = () => {
    setError("");
    if (!user) {
      setError(t("bookingWidget.loginRequired"));
      return;
    }
    if (!selectedSlot) {
      setError(t("bookingWidget.slotRequired"));
      return;
    }
    if (serviceName.trim().length < 3) {
      setError(t("bookingWidget.serviceRequired"));
      return;
    }

    createBooking.mutate(
      {
        professionalId,
        serviceName: serviceName.trim(),
        scheduledAt: selectedSlot,
        durationMinutes,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccess(t("bookingWidget.bookingSent"));
          setSelectedSlot(null);
          setNotes("");
        },
        onError: (mutationError) =>
          setError(mutationError instanceof Error ? mutationError.message : t("bookingWidget.bookingError")),
      },
    );
  };

  return (
    <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
      <p className="flex items-center gap-2 font-mono text-[12px] tracking-[0.18em] text-[var(--brand-gold)]">
        <CalendarClock size={15} /> {t("bookingWidget.heading")}
      </p>
      <p className="mt-3 text-[14px] text-[var(--color-text-secondary)]">
        {t("bookingWidget.chooseDate", { name: professionalName })}
      </p>

      <label className="mt-5 block text-[13px] font-bold text-[var(--color-text-primary)]">
        {t("bookingWidget.date")}
        <input
          type="date"
          value={date}
          min={today}
          max={maxDate}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedSlot(null);
            setSuccess("");
          }}
          className="mt-2 h-11 w-full max-w-xs rounded-lg border border-[var(--brand-border)] px-3 text-[14px]"
        />
      </label>

      <div className="mt-4">
        {availabilityQuery.isLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <Loader2 size={16} className="animate-spin" /> {t("bookingWidget.searchingSlots")}
          </div>
        ) : slots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-[13px] text-[var(--color-text-muted)]">
            {t("bookingWidget.noSlotsAvailable")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const label = new Date(slot).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setSuccess("");
                  }}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${
                    selectedSlot === slot
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                      : "border-[var(--brand-border)] text-[var(--color-text-primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-5 space-y-3 border-t border-[var(--brand-border-light)] pt-5">
          <input
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
            placeholder={t("bookingWidget.servicePlaceholder")}
            className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-3 text-[14px]"
          />
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 text-[14px]"
          >
            <option value={30}>{t("bookingWidget.duration30")}</option>
            <option value={60}>{t("bookingWidget.duration60")}</option>
            <option value={90}>{t("bookingWidget.duration90")}</option>
          </select>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder={t("bookingWidget.notesPlaceholder")}
            className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-[14px]"
          />
          {user ? (
            <button
              type="button"
              onClick={submitBooking}
              disabled={createBooking.isPending}
              className="h-11 w-full rounded-full bg-[var(--brand-primary)] text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {createBooking.isPending ? t("bookingWidget.sending") : t("bookingWidget.requestSlot")}
            </button>
          ) : (
            <Link to="/connexion" className="block h-11 rounded-full bg-[var(--brand-primary)] text-center text-[14px] font-semibold leading-[44px] text-white">
              {t("bookingWidget.loginToBook")}
            </Link>
          )}
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-[13px] font-semibold text-red-700">{error}</p>}
      {success && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{success}</p>}
    </section>
  );
}
