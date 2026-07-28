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

// "Staff" tickets: any support ticket, open to ticket-staff roles (admin
// moderation roles plus PROFESSIONAL) rather than just the ticket's author.
export const listStaffTickets = () => apiRequest<unknown[]>("/tickets/staff/all");

export const updateStaffTicketStatus = (id: string, status: string) =>
  apiRequest<unknown>(`/tickets/staff/${id}/status`, {
    method: "PUT",
    body: { status },
  });

export const replyStaffTicket = (id: string, content: string) =>
  apiRequest<unknown>(`/tickets/staff/${id}/reply`, {
    method: "POST",
    body: { content },
  });
