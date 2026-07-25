import { apiRequest } from "./client";

export const listMySavedSearches = () => apiRequest<unknown[]>("/saved-searches");

export const createSavedSearch = (name: string, summary?: string, criteria?: unknown) =>
  apiRequest<unknown>("/saved-searches", {
    method: "POST",
    body: { name, summary, criteria },
  });

export const updateSavedSearch = (id: string, payload: { isActive?: boolean; name?: string; summary?: string }) =>
  apiRequest<unknown>(`/saved-searches/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteSavedSearch = (id: string) =>
  apiRequest<null>(`/saved-searches/${id}`, { method: "DELETE" });
