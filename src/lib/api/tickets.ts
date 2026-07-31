import { apiRequest } from "./client";

export const listMyTickets = () => apiRequest<unknown[]>("/tickets");

export const getMyTicket = (id: string) => apiRequest<unknown>(`/tickets/${id}`);

export const createTicket = (subject: string, category: string, content: string, attachments?: string[]) =>
  apiRequest<unknown>("/tickets", {
    method: "POST",
    body: { subject, category, content, attachments },
  });

export const uploadTicketAttachments = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await apiRequest<{ urls: string[] }>("/tickets/attachments", {
    method: "POST",
    body,
  });
  return response.data?.urls ?? [];
};

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
