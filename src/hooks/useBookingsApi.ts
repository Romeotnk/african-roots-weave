import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getAvailability,
  listMyBookings,
  updateBookingStatus,
  type BookingStatus,
  type CreateBookingPayload,
} from "@/lib/api/bookings";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export const bookingKeys = {
  availability: (professionalId: string, date: string) => ["bookings", "availability", professionalId, date] as const,
  mine: (scope: "client" | "professional") => ["bookings", "mine", scope] as const,
};

export function useAvailability(professionalId: string, date: string) {
  return useQuery({
    queryKey: bookingKeys.availability(professionalId, date),
    queryFn: () => getAvailability(professionalId, date),
    enabled: Boolean(professionalId) && Boolean(date),
    retry: false,
  });
}

export function useMyBookings(scope: "client" | "professional" = "client") {
  return useQuery({
    queryKey: bookingKeys.mine(scope),
    queryFn: () => listMyBookings(scope),
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.availability(variables.professionalId, variables.scheduledAt.slice(0, 10)),
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, cancelReason }: { id: string; status: BookingStatus; cancelReason?: string }) =>
      updateBookingStatus(id, status, cancelReason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}
