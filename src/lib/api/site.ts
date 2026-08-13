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

export type PartnerLogo = {
  id: string;
  imageUrl: string;
  title: string | null;
  link: string | null;
};

export const getSiteConfig = () => apiRequest<SiteConfigMap>("/site/config");
export const getSiteTranslations = (locale: string) =>
  apiRequest<Record<string, string>>(`/site/translations?locale=${encodeURIComponent(locale)}`);
export const getSitePage = (slug: string) =>
  apiRequest<{ slug: string; title: string; contentHtml: string; metaTitle: string; metaDescription: string; isPublished: boolean; updatedAt: string }>(
    `/site/pages/${slug}`,
  );
export const getHomeBanners = () => apiRequest<HomeBanner[]>("/site/banners");
export const getPartnerLogos = () => apiRequest<PartnerLogo[]>("/site/partner-logos");
export const getAdsByPosition = (position: string) =>
  apiRequest<AdSpace[]>(`/site/ads?position=${encodeURIComponent(position)}`);
