import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAffiliateCapturePage,
  getAffiliateLink,
  getMlmEarnings,
  getMlmStats,
  getMlmTree,
  trackAffiliateClick,
} from "@/lib/api/mlm";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export const mlmKeys = {
  tree: ["mlm", "tree"] as const,
  earnings: ["mlm", "earnings"] as const,
  stats: ["mlm", "stats"] as const,
  link: ["mlm", "affiliate-link"] as const,
  capture: (code: string) => ["mlm", "capture", code] as const,
};

export function useMlmTree() {
  return useQuery({
    queryKey: mlmKeys.tree,
    queryFn: getMlmTree,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useMlmEarnings() {
  return useQuery({
    queryKey: mlmKeys.earnings,
    queryFn: getMlmEarnings,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useMlmStats() {
  return useQuery({
    queryKey: mlmKeys.stats,
    queryFn: getMlmStats,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useAffiliateLink() {
  return useQuery({
    queryKey: mlmKeys.link,
    queryFn: getAffiliateLink,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useAffiliateCapturePage(code: string) {
  return useQuery({
    queryKey: mlmKeys.capture(code),
    queryFn: () => getAffiliateCapturePage(code),
    enabled: Boolean(code),
    retry: false,
  });
}

export function useTrackAffiliateClick() {
  return useMutation({
    mutationFn: trackAffiliateClick,
  });
}
