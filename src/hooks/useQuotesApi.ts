import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptQuote,
  createQuoteRequest,
  declineQuote,
  listMyQuotes,
  proposeQuote,
} from "@/lib/api/quotes";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export const quoteKeys = {
  mine: (scope: "buyer" | "seller") => ["quotes", "mine", scope] as const,
};

export function useMyQuotes(scope: "buyer" | "seller" = "buyer") {
  return useQuery({
    queryKey: quoteKeys.mine(scope),
    queryFn: () => listMyQuotes(scope),
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useCreateQuoteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, message }: { productId: string; message?: string }) => createQuoteRequest(productId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useProposeQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, proposedPrice, responseNote }: { id: string; proposedPrice: number; responseNote?: string }) =>
      proposeQuote(id, proposedPrice, responseNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useDeclineQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declineQuote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });
}
