import type { Product, Professional } from "@/types";
import { products as fallbackProducts } from "@/data/products";
import { professionals as fallbackProfessionals } from "@/data/professionals";
import { apiRequest } from "./client";

type BackendProduct = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  category: string;
  type: "PHYSICAL" | "SERVICE" | "DIGITAL";
  price: string | number;
  images: string[];
  sellerId?: string;
  auctionEnabled?: boolean;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    professionalProfile?: {
      displayName: string;
      averageRating: number;
      totalReviews: number;
      location: string;
      isVerified: boolean;
    } | null;
  };
};

export type ProductPayload = {
  title: string;
  description: string;
  price: number | string;
  category: string;
  type: "PHYSICAL" | "SERVICE" | "DIGITAL";
  images?: string[];
  stock?: number;
  auctionEnabled?: boolean;
  auctionEndDate?: string;
  commissionRate?: number;
  downloadLimit?: number;
  fileUrl?: string;
};

export type UpdateProductPayload = Partial<ProductPayload> & {
  isActive?: boolean;
  isApproved?: boolean;
};

type BackendProfessional = {
  id: string;
  displayName: string;
  specialty: string[];
  biography: string;
  location: string;
  photos: string[];
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
  };
};

const fallbackImage = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop";
const fallbackAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop";

const productTypeMap = {
  PHYSICAL: "physical",
  SERVICE: "service",
  DIGITAL: "digital",
} as const;

const asList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.products)) return record.products;
    if (Array.isArray(record.professionals)) return record.professionals;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

export const toProduct = (product: BackendProduct): Product => ({
  id: product.id,
  title: product.title,
  category: product.category.replaceAll("_", " "),
  type: productTypeMap[product.type],
  price: Number(product.price),
  currency: "FCFA",
  image: product.images[0] ?? fallbackImage,
  sellerId: product.seller?.professionalProfile?.id ?? product.seller?.id ?? product.sellerId ?? "",
  sellerName: product.seller?.professionalProfile?.displayName ?? `${product.seller?.firstName ?? ""} ${product.seller?.lastName ?? ""}`.trim(),
  sellerAvatar: fallbackAvatar,
  rating: product.seller?.professionalProfile?.averageRating ?? 0,
  reviewCount: product.seller?.professionalProfile?.totalReviews ?? 0,
  auction: product.auctionEnabled,
});

export const toProfessional = (professional: BackendProfessional): Professional => ({
  id: professional.id,
  name: professional.displayName,
  specialty: professional.specialty[0] ?? "Praticien traditionnel",
  specialties: professional.specialty,
  location: professional.location,
  country: professional.user.country,
  bio: professional.biography,
  avatar: professional.photos[0] ?? fallbackAvatar,
  cover: professional.photos[1] ?? professional.photos[0] ?? fallbackImage,
  verified: professional.isVerified,
  rating: professional.averageRating,
  reviewCount: professional.totalReviews,
});

export const getProducts = async (params: URLSearchParams) => {
  const query = params.toString();
  try {
    const response = await apiRequest<unknown>(`/products${query ? `?${query}` : ""}`);
    const items = asList(response.data) as BackendProduct[];
    return {
      products: items.map(toProduct),
      pagination: response.pagination,
    };
  } catch {
    return { products: fallbackProducts, pagination: undefined };
  }
};

export const getProfessionals = async (params: URLSearchParams) => {
  const query = params.toString();
  try {
    const response = await apiRequest<unknown>(`/professionals${query ? `?${query}` : ""}`);
    const items = asList(response.data) as BackendProfessional[];
    return {
      professionals: items.map(toProfessional),
      pagination: response.pagination,
    };
  } catch {
    return { professionals: fallbackProfessionals, pagination: undefined };
  }
};

export const getProfessionalById = async (id: string) => {
  try {
    const response = await apiRequest<BackendProfessional>(`/professionals/${id}`);
    return response.data ? toProfessional(response.data) : null;
  } catch {
    return fallbackProfessionals.find((professional) => professional.id === id) ?? null;
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    const response = await apiRequest<BackendProduct>(`/products/${slug}`);
    return response.data ? toProduct(response.data) : null;
  } catch {
    return fallbackProducts.find((product) => product.id === slug) ?? null;
  }
};

export const createProduct = async (payload: ProductPayload) => {
  const response = await apiRequest<BackendProduct>("/products", {
    method: "POST",
    body: payload,
  });
  return response.data ? toProduct(response.data) : null;
};

export const updateProduct = async (id: string, payload: UpdateProductPayload) => {
  const response = await apiRequest<BackendProduct>(`/products/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data ? toProduct(response.data) : null;
};

export const deleteProduct = async (id: string) => {
  const response = await apiRequest<null>(`/products/${id}`, { method: "DELETE" });
  return response.data;
};

export const uploadProductImages = async (id: string, files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("images", file));
  const response = await apiRequest<{ id: string; images: string[]; watermarked: boolean }>(`/products/${id}/upload-images`, {
    method: "POST",
    body,
  });
  return response.data;
};

export const listProductBids = async (id: string) => {
  const response = await apiRequest<unknown>(`/products/${id}/bids`);
  return asList(response.data);
};

export const placeProductBid = async (id: string, amount: number) => {
  const response = await apiRequest<unknown>(`/products/${id}/bids`, {
    method: "POST",
    body: { amount },
  });
  return response.data;
};
