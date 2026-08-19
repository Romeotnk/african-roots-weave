import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { CalendarClock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { bookingKeys, useCreateBooking } from "@/hooks/useBookingsApi";
import { getAvailability } from "@/lib/api/bookings";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS_AHEAD = 60;

// Seven parallel calls to the existing single-day availability endpoint
// instead of a new backend week-range endpoint: getAvailability's slot
// computation (schedule parsing, overlap-checking against existing bookings)
// stays the single source of truth, so this strip can never silently drift
// from what the day-by-day picker would show.
function useWeekAvailability(professionalId: string, dates: string[]) {
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: bookingKeys.availability(professionalId, date),
      queryFn: () => getAvailability(professionalId, date),
      enabled: Boolean(professionalId) && Boolean(date),
      retry: false as const,
    })),
  });
}

export function BookingWidget({ professionalId, professionalName }: { professionalId: string; professionalName: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = useMemo(() => new Date(new Date().toDateString()), []);
  const maxDate = useMemo(() => new Date(today.getTime() + MAX_DAYS_AHEAD * DAY_MS), [today]);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => {
    const start = new Date(today.getTime() + weekOffset * 7 * DAY_MS);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY_MS));
  }, [today, weekOffset]);
  const weekDateStrings = useMemo(() => weekDates.map(toDateInputValue), [weekDates]);

  const [selectedDate, setSelectedDate] = useState(weekDateStrings[0]);
  useEffect(() => {
    if (!weekDateStrings.includes(selectedDate)) setSelectedDate(weekDateStrings[0]);
  }, [weekDateStrings, selectedDate]);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("Consultation");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const weekQueries = useWeekAvailability(professionalId, weekDateStrings);
  const createBooking = useCreateBooking();

  const canGoBack = weekOffset > 0;
  const canGoForward = weekDates[0].getTime() + 7 * DAY_MS <= maxDate.getTime();

  const selectedIndex = weekDateStrings.indexOf(selectedDate);
  const selectedQuery = weekQueries[selectedIndex];
  const slots = selectedQuery?.data ?? [];

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

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWeekOffset((value) => Math.max(0, value - 1))}
          disabled={!canGoBack}
          aria-label={t("bookingWidget.previousWeek")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--brand-border)] text-[var(--color-text-secondary)] disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="grid flex-1 grid-cols-7 gap-1.5">
          {weekDates.map((day, index) => {
            const dateStr = weekDateStrings[index];
            const query = weekQueries[index];
            const slotCount = query?.data?.length ?? 0;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedSlot(null);
                  setSuccess("");
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[10px] border px-1 py-2 text-center transition",
                  isSelected ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] text-[var(--color-text-primary)] hover:border-[var(--brand-primary)]",
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-[0.06em]", isSelected ? "text-white/80" : "text-[var(--color-text-muted)]")}>
                  {day.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}
                </span>
                <span className="text-[15px] font-bold">{day.getDate()}</span>
                {query?.isLoading ? (
                  <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", isSelected ? "bg-white/60" : "bg-[var(--brand-border)]")} />
                ) : (
                  <span className={cn("h-1.5 w-1.5 rounded-full", slotCount > 0 ? (isSelected ? "bg-white" : "bg-[var(--brand-success)]") : "bg-transparent")} />
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((value) => value + 1)}
          disabled={!canGoForward}
          aria-label={t("bookingWidget.nextWeek")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--brand-border)] text-[var(--color-text-secondary)] disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-4">
        {selectedQuery?.isLoading ? (
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
