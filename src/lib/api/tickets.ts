import { apiRequest } from "./client";

export const listMyTickets = () => apiRequest<unknown[]>("/tickets");

export const getMyTicket = (id: string) => apiRequest<unknown>(`/tickets/${id}`);

export const createTicket = (subject: string, category: string, content: string) =>
  apiRequest<unknown>("/tickets", {
    method: "POST",
    body: { subject, category, content },
  });

export const replyMyTicket = (id: string, content: string) =>
  apiRequest<unknown>(`/tickets/${id}/reply`, {
    method: "POST",
    body: { content },
  });
