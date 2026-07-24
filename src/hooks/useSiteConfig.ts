import { useQuery } from "@tanstack/react-query";
import { getSiteConfig, getSitePage } from "@/lib/api/site";

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site", "config"],
    queryFn: getSiteConfig,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSitePage(slug: string) {
  return useQuery({
    queryKey: ["site", "pages", slug],
    queryFn: () => getSitePage(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}
