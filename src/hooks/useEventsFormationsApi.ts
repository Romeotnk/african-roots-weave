import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createFormation,
  downloadFormation,
  enrollFormation,
  getEvent,
  getFormation,
  getMyFormationEnrollment,
  listEvents,
  listFormations,
  listMyEvents,
  listMyFormations,
  listMyRegistrations,
  registerEvent,
  unregisterEvent,
  updateEvent,
  updateFormation,
  updateFormationProgress,
  type EventPayload,
  type EventQuery,
  type FormationPayload,
  type FormationQuery,
} from "@/lib/api/eventsFormations";

const isBrowser = typeof window !== "undefined";

export const eventsFormationKeys = {
  events: (params: EventQuery = {}) => ["events", params] as const,
  event: (id: string) => ["events", id] as const,
  formations: (params: FormationQuery = {}) => ["formations", params] as const,
  formation: (id: string) => ["formations", id] as const,
};

export function useEvents(params: EventQuery = {}) {
  return useQuery({
    queryKey: eventsFormationKeys.events(params),
    queryFn: () => listEvents(params),
    enabled: isBrowser,
    retry: false,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventsFormationKeys.event(id),
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useMyEvents(params: EventQuery = {}) {
  return useQuery({
    queryKey: ["events", "mine", params] as const,
    queryFn: () => listMyEvents(params),
    enabled: isBrowser,
    retry: false,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventPayload) => createEvent(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EventPayload> }) => updateEvent(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unregisterEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ["events", "registrations", "mine"] as const,
    queryFn: listMyRegistrations,
    enabled: isBrowser,
    retry: false,
  });
}

export function useFormations(params: FormationQuery = {}) {
  return useQuery({
    queryKey: eventsFormationKeys.formations(params),
    queryFn: () => listFormations(params),
    enabled: isBrowser,
    retry: false,
  });
}

export function useMyFormations(params: FormationQuery = {}) {
  return useQuery({
    queryKey: ["formations", "mine", params] as const,
    queryFn: () => listMyFormations(params),
    enabled: isBrowser,
    retry: false,
  });
}

export function useFormation(id: string) {
  return useQuery({
    queryKey: eventsFormationKeys.formation(id),
    queryFn: () => getFormation(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormationPayload) => createFormation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["formations"] }),
  });
}

export function useUpdateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormationPayload }) => updateFormation(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      queryClient.invalidateQueries({ queryKey: eventsFormationKeys.formation(variables.id) });
    },
  });
}

export function useDownloadFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: downloadFormation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["formations"] }),
  });
}

export function useMyFormationEnrollment(id: string) {
  return useQuery({
    queryKey: ["formations", id, "enrollment"] as const,
    queryFn: () => getMyFormationEnrollment(id),
    enabled: isBrowser && Boolean(id),
    retry: false,
  });
}

export function useEnrollFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: "wallet" | "card" | "mobile_money" | "free" }) =>
      enrollFormation(id, method),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["formations", variables.id, "enrollment"] });
    },
  });
}

export function useUpdateFormationProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lessonId, completed }: { id: string; lessonId: string; completed: boolean }) =>
      updateFormationProgress(id, lessonId, completed),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["formations", variables.id, "enrollment"] });
    },
  });
}