import { apiRequest } from "./client";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Booking = {
  id: string;
  clientId: string;
  professionalId: string;
  productId: string | null;
  serviceName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: BookingStatus;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  client: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    professionalProfile: { displayName: string } | null;
  };
  product: { id: string; title: string } | null;
};

export type CreateBookingPayload = {
  professionalId: string;
  serviceName: string;
  scheduledAt: string;
  durationMinutes?: number;
  productId?: string;
  notes?: string;
};

export async function getAvailability(professionalId: string, date: string) {
  const response = await apiRequest<string[]>(
    `/bookings/availability/${professionalId}?date=${encodeURIComponent(date)}`,
  );
  return response.data ?? [];
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await apiRequest<Booking>("/bookings", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function listMyBookings(scope: "client" | "professional" = "client") {
  const response = await apiRequest<Booking[]>(`/bookings/mine?scope=${scope}`);
  return response.data ?? [];
}

export async function updateBookingStatus(id: string, status: BookingStatus, cancelReason?: string) {
  const response = await apiRequest<Booking>(`/bookings/${id}`, {
    method: "PUT",
    body: { status, cancelReason },
  });
  return response.data;
}
