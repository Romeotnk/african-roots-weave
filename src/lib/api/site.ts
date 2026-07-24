import { apiRequest } from "./client";

export type SiteConfigMap = Record<string, string>;

export const getSiteConfig = () => apiRequest<SiteConfigMap>("/site/config");
export const getSitePage = (slug: string) =>
  apiRequest<{ slug: string; title: string; contentHtml: string; metaTitle: string; metaDescription: string; isPublished: boolean; updatedAt: string }>(
    `/site/pages/${slug}`,
  );
