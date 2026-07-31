import { apiRequest } from "./client";
import { getStoredAffiliateCode } from "./affiliate";

export const listMyOrders = (scope: "all" | "buyer" | "seller" = "all") =>
  apiRequest<unknown[]>(`/orders/mine?scope=${scope === "buyer" ? "purchases" : scope === "seller" ? "sales" : "all"}`);

export const createOrder = (productId: string, quantity = 1, couponCode?: string) =>
  apiRequest<{ id: string }>("/orders", {
    method: "POST",
    body: { productId, quantity, couponCode: couponCode || undefined, affiliateCode: getStoredAffiliateCode() ?? undefined },
  });

export const confirmOrderDelivery = (orderId: string) =>
  apiRequest<unknown>(`/orders/${orderId}/confirm-delivery`, {
    method: "POST",
  });

export const markOrderShipped = (orderId: string) =>
  apiRequest<unknown>(`/orders/${orderId}/ship`, {
    method: "POST",
  });

export const openOrderDispute = (orderId: string, reason: string) =>
  apiRequest<unknown>(`/orders/${orderId}/dispute`, {
    method: "POST",
    body: { reason },
  });

export const requestOrderRefund = (orderId: string, reason: string) =>
  apiRequest<unknown>(`/orders/${orderId}/refund-request`, {
    method: "POST",
    body: { reason },
  });

export const acknowledgeOrderRefund = (orderId: string, note?: string) =>
  apiRequest<unknown>(`/orders/${orderId}/refund-ack`, {
    method: "POST",
    body: { note },
  });
