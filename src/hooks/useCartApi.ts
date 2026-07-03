import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, deleteCartItem, getCart, updateCartItem } from "@/lib/api/cart";

export const cartKeys = {
  all: ["cart"] as const,
};

export function useRemoteCart() {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: getCart,
    retry: false,
    enabled: typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken")),
  });
}

export function useAddRemoteCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => addCartItem(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useUpdateRemoteCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useDeleteRemoteCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}
