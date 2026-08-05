import { apiRequest } from "./client";

export type TaxonomyScope = "PROFESSIONAL_SPECIALTY" | "ARTICLE_CATEGORY" | "PRODUCT_CATEGORY";

export type TaxonomyItem = {
  id: string;
  scope: TaxonomyScope;
  name: string;
  slug: string;
  position: number;
  parentId: string | null;
  createdAt: string;
};

export const listTaxonomy = async (scope: TaxonomyScope) => {
  const response = await apiRequest<TaxonomyItem[]>(`/site/taxonomy?scope=${scope}`);
  return response.data ?? [];
};

export const listAdminTaxonomy = async (scope: TaxonomyScope) => {
  const response = await apiRequest<TaxonomyItem[]>(`/admin/taxonomy?scope=${scope}`);
  return response.data ?? [];
};

export const createTaxonomy = (scope: TaxonomyScope, name: string, parentId?: string) =>
  apiRequest<TaxonomyItem>("/admin/taxonomy", { method: "POST", body: { scope, name, parentId } });

export const updateTaxonomy = (id: string, payload: { name?: string; position?: number }) =>
  apiRequest<TaxonomyItem>(`/admin/taxonomy/${id}`, { method: "PUT", body: payload });

export const deleteTaxonomy = (id: string) =>
  apiRequest<null>(`/admin/taxonomy/${id}`, { method: "DELETE" });
