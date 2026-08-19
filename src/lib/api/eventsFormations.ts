import { apiRequest } from "./client";

export type EventQuery = {
  page?: number;
  limit?: number;
  type?: string;
};

export type FormationQuery = EventQuery & {
  category?: string;
  tag?: string;
  createdById?: string;
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

const asList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.events)) return record.events;
    if (Array.isArray(record.formations)) return record.formations;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

export async function listEvents(params: EventQuery = {}) {
  const query = toQuery(params);
  try {
    const response = await apiRequest<unknown>(`/events${query ? `?${query}` : ""}`);
    return { events: asList(response.data), pagination: response.pagination };
  } catch {
    return { events: [], pagination: undefined };
  }
}

export async function getEvent(id: string) {
  const response = await apiRequest<unknown>(`/events/${id}`);
  return response.data;
}

export async function listMyRegistrations() {
  const response = await apiRequest<unknown>("/events/registrations/mine");
  return asList(response.data);
}

export async function createEvent(payload: EventPayload) {
  const response = await apiRequest<unknown>("/events", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function listMyEvents(params: EventQuery = {}) {
  const query = toQuery(params);
  try {
    const response = await apiRequest<unknown>(`/events/mine${query ? `?${query}` : ""}`);
    return { events: asList(response.data), pagination: response.pagination };
  } catch {
    return { events: [], pagination: undefined };
  }
}

export async function updateEvent(id: string, payload: Partial<EventPayload>) {
  const response = await apiRequest<unknown>(`/events/${id}`, {
    method: "PUT",
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
  try {
    const response = await apiRequest<unknown>(`/formations${query ? `?${query}` : ""}`);
    return { formations: asList(response.data), pagination: response.pagination };
  } catch {
    return { formations: [], pagination: undefined };
  }
}

export async function listMyFormations(params: FormationQuery = {}) {
  const query = toQuery(params);
  try {
    const response = await apiRequest<unknown>(`/formations/mine${query ? `?${query}` : ""}`);
    return { formations: asList(response.data), pagination: response.pagination };
  } catch {
    return { formations: [], pagination: undefined };
  }
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

export async function updateFormation(id: string, payload: FormationPayload) {
  const response = await apiRequest<unknown>(`/formations/${id}`, {
    method: "PUT",
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

export type FormationEnrollment = {
  id: string;
  formationId: string;
  userId: string;
  pricePaid: number | string;
  paymentMethod: string | null;
  completedLessonIds: string[];
  enrolledAt: string;
};

export async function getMyFormationEnrollment(id: string) {
  const response = await apiRequest<FormationEnrollment | null>(`/formations/${id}/enrollment`);
  return response.data;
}

export type EnrollFormationResult = {
  enrollment?: FormationEnrollment | null;
  checkoutUrl?: string | null;
};

export async function enrollFormation(id: string, method: "wallet" | "card" | "mobile_money" | "free") {
  const response = await apiRequest<EnrollFormationResult>(`/formations/${id}/enroll`, {
    method: "POST",
    body: { method },
  });
  return response.data;
}

export async function updateFormationProgress(id: string, lessonId: string, completed: boolean) {
  const response = await apiRequest<FormationEnrollment>(`/formations/${id}/progress`, {
    method: "PUT",
    body: { lessonId, completed },
  });
  return response.data;
}

export type MyFormationEnrollment = FormationEnrollment & {
  lessonCount: number;
  progressPercent: number;
  formation: {
    id: string;
    slug: string | null;
    title: string;
    coverImage: string | null;
    category: string;
    duration: string | null;
    createdBy: { firstName: string; lastName: string };
  };
};

export async function listMyFormationEnrollments() {
  const response = await apiRequest<unknown>("/formations/enrollments/mine");
  return asList(response.data) as MyFormationEnrollment[];
}
