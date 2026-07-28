import { apiRequest } from "./client";

export type QuoteStatus = "PENDING" | "PROPOSED" | "ACCEPTED" | "DECLINED";

export type QuoteRequest = {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: QuoteStatus;
  proposedPrice: string | number | null;
  message: string | null;
  responseNote: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  product: { id: string; title: string; images: string[]; isQuoteOnly: boolean };
  buyer: { id: string; firstName: string; lastName: string };
  seller: { id: string; firstName: string; lastName: string };
};

export async function createQuoteRequest(productId: string, message?: string) {
  const response = await apiRequest<QuoteRequest>("/quotes", { method: "POST", body: { productId, message } });
  return response.data;
}

export async function proposeQuote(id: string, proposedPrice: number, responseNote?: string) {
  const response = await apiRequest<QuoteRequest>(`/quotes/${id}/propose`, {
    method: "POST",
    body: { proposedPrice, responseNote },
  });
  return response.data;
}

export async function acceptQuote(id: string) {
  const response = await apiRequest<QuoteRequest>(`/quotes/${id}/accept`, { method: "POST" });
  return response.data;
}

export async function declineQuote(id: string) {
  const response = await apiRequest<QuoteRequest>(`/quotes/${id}/decline`, { method: "POST" });
  return response.data;
}

export async function listMyQuotes(scope: "buyer" | "seller" = "buyer") {
  const response = await apiRequest<QuoteRequest[]>(`/quotes/mine?scope=${scope}`);
  return response.data ?? [];
}
