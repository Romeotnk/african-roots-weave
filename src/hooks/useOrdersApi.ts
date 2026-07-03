import { useMutation } from "@tanstack/react-query";
import { confirmOrderDelivery, createOrder, openOrderDispute, requestOrderRefund } from "@/lib/api/orders";

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => createOrder(productId, quantity),
  });
}

export function useConfirmOrderDelivery() {
  return useMutation({
    mutationFn: confirmOrderDelivery,
  });
}

export function useOpenOrderDispute() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => openOrderDispute(orderId, reason),
  });
}

export function useRequestOrderRefund() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => requestOrderRefund(orderId, reason),
  });
}
