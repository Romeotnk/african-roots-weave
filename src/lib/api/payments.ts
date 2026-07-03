import { apiRequest } from "./client";

export type PaymentMethod = "wallet" | "card" | "mobile_money";

export const initiatePayment = (orderId: string, method: PaymentMethod) =>
  apiRequest<{ checkoutUrl?: string | null; transactionId?: string }>("/payments/initiate", {
    method: "POST",
    body: { orderId, method },
  });
