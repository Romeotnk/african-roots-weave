import { apiRequest } from "./client";

export type AffiliateLink = {
  code: string;
  link: string;
};

export type MlmNode = {
  id: string;
  userId: string;
  level: number;
  affiliateCode: string;
  totalDownlineCount: number;
  totalEarnings: string | number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; country: string; role: string };
  children: MlmNode[];
};

export type MlmCommission = {
  id: string;
  amount: string | number;
  type: "DIRECT" | "MLM_LEVEL1" | "MLM_LEVEL2" | "MLM_LEVEL3" | "AFFILIATE";
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
  createdAt: string;
  paidAt: string | null;
  sourceOrder: { id: string; product: { title: string } | null } | null;
};

export type MlmEarningsRow = {
  type: string;
  _sum: { amount: string | number | null };
  _count: { id: number };
};

export async function getMlmTree() {
  const response = await apiRequest<MlmNode>("/mlm/my-tree");
  return response.data;
}

export async function getMlmEarnings() {
  const response = await apiRequest<MlmEarningsRow[]>("/mlm/earnings");
  return response.data ?? [];
}

export async function getMlmStats() {
  const response = await apiRequest<unknown>("/mlm/stats");
  return response.data;
}

export async function getMyCommissions() {
  const response = await apiRequest<MlmCommission[]>("/mlm/commissions/mine");
  return response.data ?? [];
}

export async function getMlmLeaderboard() {
  const response = await apiRequest<unknown[]>("/mlm/leaderboard");
  return response.data ?? [];
}

export async function getAffiliateLink() {
  const response = await apiRequest<AffiliateLink>("/mlm/affiliate-link");
  return response.data;
}

export async function trackAffiliateClick(code: string) {
  const response = await apiRequest<unknown>("/mlm/track-click", {
    method: "POST",
    body: { code },
  });
  return response.data;
}

export async function getAffiliateCapturePage(code: string) {
  const response = await apiRequest<unknown>(`/mlm/capture-page/${code}`);
  return response.data;
}
