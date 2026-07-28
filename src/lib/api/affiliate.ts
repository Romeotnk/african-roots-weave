import { apiRequest } from "./client";

export type MyAffiliateLink = {
  code: string;
  link: string;
  clicks: number;
};

export type AffiliateCommission = {
  id: string;
  amount: string | number;
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
  createdAt: string;
  paidAt: string | null;
  sourceOrder: { id: string; product: { title: string } | null } | null;
};

export const AFFILIATE_CODE_STORAGE_KEY = "iwosan.affiliateCode";

export async function getMyAffiliateLink() {
  const response = await apiRequest<MyAffiliateLink>("/affiliate/me");
  return response.data;
}

export async function trackAffiliateClick(code: string) {
  const response = await apiRequest<null>("/affiliate/track-click", { method: "POST", body: { code } });
  return response.data;
}

export async function getMyAffiliateCommissions() {
  const response = await apiRequest<AffiliateCommission[]>("/affiliate/commissions");
  return response.data ?? [];
}

export const getStoredAffiliateCode = (): string | null =>
  typeof window === "undefined" ? null : window.localStorage.getItem(AFFILIATE_CODE_STORAGE_KEY);
