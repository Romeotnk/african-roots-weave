import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmOrderDelivery, createOrder, listMyOrders, markOrderShipped, openOrderDispute, requestOrderRefund } from "@/lib/api/orders";

export function useMyOrders(scope: "all" | "buyer" | "seller" = "all") {
  return useQuery({
    queryKey: ["orders", "mine", scope] as const,
    queryFn: () => listMyOrders(scope),
    enabled: typeof window !== "undefined",
    retry: false,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => createOrder(productId, quantity),
  });
}

export function useConfirmOrderDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmOrderDelivery,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "mine"] }),
  });
}

export function useMarkOrderShipped() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markOrderShipped,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "mine"] }),
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
