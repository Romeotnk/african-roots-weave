import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMySubscription, getSubscriptionPlans, upgradeMySubscription, type SubscriptionPlanKey } from "@/lib/api/subscriptions";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: getSubscriptionPlans,
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ["subscriptions", "me"],
    queryFn: getMySubscription,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, autoRenew }: { plan: SubscriptionPlanKey; autoRenew: boolean }) =>
      upgradeMySubscription(plan, autoRenew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "me"] });
    },
  });
}
