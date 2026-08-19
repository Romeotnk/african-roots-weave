import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { createNotification } from "../services/notification.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const SLOT_STEP_MINUTES = 30;

type AvailabilityRange = { dayOfWeek: number; startTime: string; endTime: string };

// devenir-pro.tsx lets a professional declare availability as broad day+period
// checkboxes ("Lundi-Matin", "Mercredi-Apres-midi"...) stored as
// ProfessionalProfile.availabilitySchedule = { slots: string[], ... } — this
// maps each declared period back to a concrete time range so the booking
// flow can compute real bookable slots from it.
const DAY_NAME_TO_INDEX: Record<string, number> = {
  Dimanche: 0,
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
};

const PERIOD_TO_RANGE: Record<string, { startTime: string; endTime: string }> = {
  Matin: { startTime: "09:00", endTime: "12:00" },
  "Apres-midi": { startTime: "14:00", endTime: "18:00" },
  Soir: { startTime: "18:00", endTime: "20:00" },
};

const parseSchedule = (schedule: unknown): AvailabilityRange[] => {
  const record = schedule as { slots?: unknown } | null;
  const rawSlots = Array.isArray(record?.slots) ? (record!.slots as unknown[]) : [];

  return rawSlots
    .filter((slot): slot is string => typeof slot === "string")
    .map((slot) => {
      const [dayName, ...periodParts] = slot.split("-");
      const period = periodParts.join("-");
      const dayOfWeek = DAY_NAME_TO_INDEX[dayName];
      const range = PERIOD_TO_RANGE[period];
      if (dayOfWeek === undefined || !range) return null;
      return { dayOfWeek, ...range };
    })
    .filter((item): item is AvailabilityRange => item !== null);
};

const bookingSelect = {
  id: true,
  clientId: true,
  professionalId: true,
  productId: true,
  serviceName: true,
  scheduledAt: true,
  durationMinutes: true,
  status: true,
  notes: true,
  cancelReason: true,
  createdAt: true,
  client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  professional: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      professionalProfile: { select: { displayName: true } },
    },
  },
  product: { select: { id: true, title: true } },
} satisfies Prisma.BookingSelect;

// Public: which 30-minute slots are still bookable for a professional on a given day.
export const getAvailability = asyncHandler(async (req, res) => {
  const professionalId = req.params.professionalId;
  const dateParam = String(req.query.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    throw new ApiError(400, "A 'date' query param in YYYY-MM-DD format is required");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalId },
    select: { serviceBookingEnabled: true, availabilitySchedule: true },
  });
  if (!profile || !profile.serviceBookingEnabled) {
    res.json(apiResponse(true, [], "This professional doesn't accept online bookings"));
    return;
  }

  const schedule = parseSchedule(profile.availabilitySchedule);
  const dayStart = new Date(`${dateParam}T00:00:00`);
  const dayOfWeek = dayStart.getDay();
  const daySlots = schedule.filter((slot) => slot.dayOfWeek === dayOfWeek);
  if (daySlots.length === 0) {
    res.json(apiResponse(true, [], "No availability configured for that day"));
    return;
  }

  const dayEnd = new Date(`${dateParam}T23:59:59`);
  const existingBookings = await prisma.booking.findMany({
    where: {
      professionalId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledAt: true, durationMinutes: true },
  });

  const slots: string[] = [];
  for (const range of daySlots) {
    const [startH, startM] = range.startTime.split(":").map(Number);
    const [endH, endM] = range.endTime.split(":").map(Number);
    if ([startH, startM, endH, endM].some((n) => Number.isNaN(n))) continue;

    const cursor = new Date(dayStart);
    cursor.setHours(startH, startM, 0, 0);
    const rangeEnd = new Date(dayStart);
    rangeEnd.setHours(endH, endM, 0, 0);

    while (cursor.getTime() + SLOT_STEP_MINUTES * 60_000 <= rangeEnd.getTime()) {
      const slotStart = cursor.getTime();
      const slotEnd = slotStart + SLOT_STEP_MINUTES * 60_000;
      const overlaps = existingBookings.some((booking) => {
        const bookedStart = booking.scheduledAt.getTime();
        const bookedEnd = bookedStart + booking.durationMinutes * 60_000;
        return slotStart < bookedEnd && slotEnd > bookedStart;
      });
      if (!overlaps && slotStart > Date.now()) slots.push(new Date(slotStart).toISOString());
      cursor.setTime(slotEnd);
    }
  }

  res.json(apiResponse(true, slots, "Availability retrieved"));
});

export const createBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const professionalId = String(req.body.professionalId ?? "");
  const serviceName = String(req.body.serviceName ?? "").trim();
  const scheduledAt = new Date(req.body.scheduledAt);
  const durationMinutes = Number(req.body.durationMinutes ?? 30);

  if (!professionalId || professionalId === req.user.id) {
    throw new ApiError(400, "A valid professionalId is required");
  }
  if (serviceName.length < 3) throw new ApiError(422, "serviceName is required");
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    throw new ApiError(422, "scheduledAt must be a valid future date");
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) {
    throw new ApiError(422, "durationMinutes must be between 15 and 240");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalId },
    select: { serviceBookingEnabled: true },
  });
  if (!profile || !profile.serviceBookingEnabled) {
    throw new ApiError(400, "This professional doesn't accept online bookings");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const dayStart = new Date(scheduledAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(scheduledAt);
    dayEnd.setHours(23, 59, 59, 999);

    const sameDayBookings = await tx.booking.findMany({
      where: { professionalId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledAt: { gte: dayStart, lte: dayEnd } },
      select: { scheduledAt: true, durationMinutes: true },
    });
    const slotStart = scheduledAt.getTime();
    const slotEnd = slotStart + durationMinutes * 60_000;
    const hasConflict = sameDayBookings.some((existing) => {
      const bookedStart = existing.scheduledAt.getTime();
      const bookedEnd = bookedStart + existing.durationMinutes * 60_000;
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
    if (hasConflict) throw new ApiError(409, "This time slot was just booked, please choose another one");

    return tx.booking.create({
      data: {
        clientId: req.user!.id,
        professionalId,
        productId: typeof req.body.productId === "string" ? req.body.productId : undefined,
        serviceName,
        scheduledAt,
        durationMinutes,
        notes: typeof req.body.notes === "string" ? req.body.notes.slice(0, 2000) : undefined,
      },
      select: bookingSelect,
    });
  });

  res.status(201).json(apiResponse(true, booking, "Booking requested"));
});

export const listMyBookings = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const scope = String(req.query.scope ?? "client");
  const where =
    scope === "professional" ? { professionalId: req.user.id } : { clientId: req.user.id };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { scheduledAt: "desc" },
    take: 100,
    select: bookingSelect,
  });
  res.json(apiResponse(true, bookings, "Bookings retrieved"));
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.booking.findUnique({
    where: { id: req.params.id },
    select: { clientId: true, professionalId: true, status: true },
  });
  if (!existing) throw new ApiError(404, "Booking not found");

  const isClient = existing.clientId === req.user.id;
  const isProfessional = existing.professionalId === req.user.id;
  if (!isClient && !isProfessional) throw new ApiError(403, "Forbidden");

  const nextStatus = String(req.body.status ?? "");
  const allowedForClient = ["CANCELLED"];
  const allowedForProfessional = ["CONFIRMED", "CANCELLED", "COMPLETED"];
  const allowed = isProfessional ? allowedForProfessional : allowedForClient;
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(403, `Only ${allowed.join("/")} allowed for this role`);
  }

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: {
      status: nextStatus as never,
      cancelReason: nextStatus === "CANCELLED" && typeof req.body.cancelReason === "string" ? req.body.cancelReason.slice(0, 500) : undefined,
    },
    select: bookingSelect,
  });

  if (nextStatus === "CONFIRMED") {
    await createNotification({
      userId: existing.clientId,
      type: "BOOKING_CONFIRMED",
      title: "Réservation confirmée",
      message: `Votre réservation « ${booking.serviceName} » a été confirmée.`,
      link: "/mon-compte/reservations",
    });
  } else if (nextStatus === "CANCELLED") {
    const cancelledByClient = req.user.id === existing.clientId;
    const otherPartyId = cancelledByClient ? existing.professionalId : existing.clientId;
    await createNotification({
      userId: otherPartyId,
      type: "BOOKING_CANCELLED",
      title: "Réservation annulée",
      message: `La réservation « ${booking.serviceName} » a été annulée.`,
      link: cancelledByClient ? "/tableau-de-bord/reservations" : "/mon-compte/reservations",
    });
  }

  res.json(apiResponse(true, booking, "Booking updated"));
});
