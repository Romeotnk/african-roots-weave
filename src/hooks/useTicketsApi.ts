import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTicket,
  getMyTicket,
  listMyTickets,
  listStaffTickets,
  replyMyTicket,
  replyStaffTicket,
  updateStaffTicketStatus,
  uploadTicketAttachments,
} from "@/lib/api/tickets";

const isBrowser = typeof window !== "undefined";
const hasAccessToken = () => isBrowser && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export const ticketKeys = {
  all: ["tickets", "mine"] as const,
  detail: (id: string) => ["tickets", "mine", id] as const,
  staff: ["tickets", "staff"] as const,
};

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.all,
    queryFn: listMyTickets,
    enabled: isBrowser,
    retry: false,
  });
}

export function useMyTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getMyTicket(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subject, category, content, attachments }: { subject: string; category: string; content: string; attachments?: string[] }) =>
      createTicket(subject, category, content, attachments),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useUploadTicketAttachments() {
  return useMutation({
    mutationFn: uploadTicketAttachments,
  });
}

export function useReplyTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => replyMyTicket(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useStaffTickets() {
  return useQuery({
    queryKey: ticketKeys.staff,
    queryFn: listStaffTickets,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useStaffTicketActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ticketKeys.staff });
  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: string }) => updateStaffTicketStatus(id, status),
      onSuccess: refresh,
    }),
    reply: useMutation({
      mutationFn: ({ id, content }: { id: string; content: string }) => replyStaffTicket(id, content),
      onSuccess: refresh,
    }),
  };
}
