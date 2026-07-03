import { apiRequest } from "./client";

export type AffiliateLink = {
  code: string;
  link: string;
};

export async function getMlmTree() {
  const response = await apiRequest<unknown>("/mlm/my-tree");
  return response.data;
}

export async function getMlmEarnings() {
  const response = await apiRequest<unknown>("/mlm/earnings");
  return response.data;
}

export async function getMlmStats() {
  const response = await apiRequest<unknown>("/mlm/stats");
  return response.data;
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
