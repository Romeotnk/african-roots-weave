import { useQuery } from "@tanstack/react-query";
import { getAdsByPosition, getHomeBanners, getPartnerLogos, getSiteConfig, getSitePage } from "@/lib/api/site";

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

export function useHomeBanners() {
  return useQuery({
    queryKey: ["site", "banners"],
    queryFn: getHomeBanners,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function usePartnerLogos() {
  return useQuery({
    queryKey: ["site", "partner-logos"],
    queryFn: getPartnerLogos,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAdsByPosition(position: string) {
  return useQuery({
    queryKey: ["site", "ads", position],
    queryFn: () => getAdsByPosition(position),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
