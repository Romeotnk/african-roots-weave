import { apiRequest } from "./client";

export const createOrder = (productId: string, quantity = 1) =>
  apiRequest<unknown>("/orders", {
    method: "POST",
    body: { productId, quantity },
  });

export const confirmOrderDelivery = (orderId: string) =>
  apiRequest<unknown>(`/orders/${orderId}/confirm-delivery`, {
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
