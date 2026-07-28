// Self-service plan catalog for professional sellers. Prices are monthly,
// in FCFA, charged from the wallet — matches the pattern already used for
// product boosts (see product.controller.ts's debitWalletForOption).
export const SUBSCRIPTION_PLANS = {
  FREE: { label: "Free", price: 0, maxListings: 5, maxDownloads: 10 },
  BASIC: { label: "Basic", price: 5000, maxListings: 20, maxDownloads: 50 },
  PRO: { label: "Pro", price: 15000, maxListings: 100, maxDownloads: 500 },
  EXPERT: { label: "Expert", price: 35000, maxListings: 1000, maxDownloads: 5000 },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

export const isSubscriptionPlanKey = (value: string): value is SubscriptionPlanKey =>
  Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value);
