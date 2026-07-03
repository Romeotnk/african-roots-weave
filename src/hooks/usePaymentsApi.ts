import { useMutation } from "@tanstack/react-query";
import { initiatePayment, type PaymentMethod } from "@/lib/api/payments";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: ({ orderId, method }: { orderId: string; method: PaymentMethod }) => initiatePayment(orderId, method),
  });
}
