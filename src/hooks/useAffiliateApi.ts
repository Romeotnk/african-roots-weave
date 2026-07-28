import { useQuery } from "@tanstack/react-query";
import { getMyAffiliateCommissions, getMyAffiliateLink } from "@/lib/api/affiliate";

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export function useMyAffiliateLink() {
  return useQuery({
    queryKey: ["affiliate", "me"],
    queryFn: getMyAffiliateLink,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useMyAffiliateCommissions() {
  return useQuery({
    queryKey: ["affiliate", "commissions"],
    queryFn: getMyAffiliateCommissions,
    enabled: hasAccessToken(),
    retry: false,
  });
}
