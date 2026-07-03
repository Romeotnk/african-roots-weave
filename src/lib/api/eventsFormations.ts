import { apiRequest } from "./client";

export type EventQuery = {
  page?: number;
  limit?: number;
  type?: string;
};

export type FormationQuery = EventQuery & {
  category?: string;
  tag?: string;
};

export type EventPayload = Record<string, unknown> & {
  startDate: string;
  endDate: string;
};

export type FormationPayload = Record<string, unknown>;

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export async function listEvents(params: EventQuery = {}) {
  const query = toQuery(params);
  const response = await apiRequest<unknown[]>(`/events${query ? `?${query}` : ""}`);
  return { events: response.data ?? [], pagination: response.pagination };
}

export async function getEvent(id: string) {
  const response = await apiRequest<unknown>(`/events/${id}`);
  return response.data;
}

export async function createEvent(payload: EventPayload) {
  const response = await apiRequest<unknown>("/events", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function registerEvent(id: string) {
  const response = await apiRequest<unknown>(`/events/${id}/register`, {
    method: "POST",
  });
  return response.data;
}

export async function unregisterEvent(id: string) {
  const response = await apiRequest<null>(`/events/${id}/register`, {
    method: "DELETE",
  });
  return response.data;
}

export async function listFormations(params: FormationQuery = {}) {
  const query = toQuery(params);
  const response = await apiRequest<unknown[]>(`/formations${query ? `?${query}` : ""}`);
  return { formations: response.data ?? [], pagination: response.pagination };
}

export async function getFormation(id: string) {
  const response = await apiRequest<unknown>(`/formations/${id}`);
  return response.data;
}

export async function createFormation(payload: FormationPayload) {
  const response = await apiRequest<unknown>("/formations", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function downloadFormation(id: string) {
  const response = await apiRequest<unknown>(`/formations/${id}/download`, {
    method: "POST",
  });
  return response.data;
}
