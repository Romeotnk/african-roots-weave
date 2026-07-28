import { apiRequest } from "./client";

export type SiteConfigMap = Record<string, string>;

export type HomeBanner = {
  id: string;
  imageUrl: string;
  title: string | null;
  link: string | null;
};

export type AdSpace = {
  id: string;
  position: string;
  code: string;
};

export const getSiteConfig = () => apiRequest<SiteConfigMap>("/site/config");
export const getSitePage = (slug: string) =>
  apiRequest<{ slug: string; title: string; contentHtml: string; metaTitle: string; metaDescription: string; isPublished: boolean; updatedAt: string }>(
    `/site/pages/${slug}`,
  );
export const getHomeBanners = () => apiRequest<HomeBanner[]>("/site/banners");
export const getAdsByPosition = (position: string) =>
  apiRequest<AdSpace[]>(`/site/ads?position=${encodeURIComponent(position)}`);
