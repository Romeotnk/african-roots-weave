import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsWithFallback,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { authTokenStore } from "@/lib/api/client";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotifications() {
  const hasToken = typeof window !== "undefined" && Boolean(authTokenStore.get());
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: getNotificationsWithFallback,
    enabled: hasToken,
    staleTime: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
