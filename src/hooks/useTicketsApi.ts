import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTicket, getMyTicket, listMyTickets, replyMyTicket } from "@/lib/api/tickets";

const isBrowser = typeof window !== "undefined";

export const ticketKeys = {
  all: ["tickets", "mine"] as const,
  detail: (id: string) => ["tickets", "mine", id] as const,
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
    mutationFn: ({ subject, category, content }: { subject: string; category: string; content: string }) =>
      createTicket(subject, category, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useReplyTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => replyMyTicket(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}
