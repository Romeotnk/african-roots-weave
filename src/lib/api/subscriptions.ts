import { apiRequest } from "./client";

export type SubscriptionPlanKey = "FREE" | "BASIC" | "PRO" | "EXPERT";

export type SubscriptionPlanDefinition = {
  label: string;
  price: number;
  maxListings: number;
  maxDownloads: number;
};

export type MySubscription = {
  id: string;
  plan: SubscriptionPlanKey;
  price: string | number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  maxListings: number;
  maxDownloads: number;
  autoRenew: boolean;
  activeListings: number;
};

export async function getSubscriptionPlans() {
  const response = await apiRequest<Record<SubscriptionPlanKey, SubscriptionPlanDefinition>>("/subscriptions/plans");
  return response.data;
}

export async function getMySubscription() {
  const response = await apiRequest<MySubscription>("/subscriptions/me");
  return response.data;
}

export async function upgradeMySubscription(plan: SubscriptionPlanKey, autoRenew: boolean) {
  const response = await apiRequest<MySubscription>("/subscriptions/me/upgrade", {
    method: "POST",
    body: { plan, autoRenew },
  });
  return response.data;
}
