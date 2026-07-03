import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCoupon, listCoupons, validateCoupon, type CouponPayload, type CouponQuery } from "@/lib/api/coupons";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export const couponKeys = {
  all: (params: CouponQuery = {}) => ["coupons", params] as const,
};

export function useCoupons(params: CouponQuery = {}) {
  return useQuery({
    queryKey: couponKeys.all(params),
    queryFn: () => listCoupons(params),
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: validateCoupon,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => createCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
}
