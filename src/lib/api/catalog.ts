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
  stock?: number;
  auctionEnabled?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  isUrgent?: boolean;
  urgentUntil?: string | null;
  isQuoteOnly?: boolean;
  viewCount?: number;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
      latitude?: number | null;
      longitude?: number | null;
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
  isQuoteOnly?: boolean;
};

export type UpdateProductPayload = Partial<ProductPayload> & {
  isActive?: boolean;
  isApproved?: boolean;
};

export type MyProduct = {
  id: string;
  title: string;
  category: string;
  type: "physical" | "service" | "digital";
  price: number;
  stock: number;
  viewCount: number;
  isActive: boolean;
  isApproved: boolean;
  expiresAt: string | null;
  updatedAt: string;
  isFeatured: boolean;
  featuredUntil: string | null;
  isUrgent: boolean;
  urgentUntil: string | null;
};

type BackendProfessional = {
  id: string;
  displayName: string;
  specialty: string[];
  biography: string;
  innovations?: string | null;
  communityImpact?: string | null;
  philosophy?: string | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  photos: string[];
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  serviceBookingEnabled?: boolean;
  socialLinks?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
  } | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
  };
};

const fallbackImage = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop";
const fallbackAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop";
// Backend/API failures fall back to sample data only in local development —
// production must surface the real error instead of silently showing
// fictitious sellers/products.
const isDev = import.meta.env.DEV;

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
  // Product.sellerId is a User.id — the same identity messaging and the
  // seller profile page (/pro/$id) use. Never the professionalProfile id.
  sellerId: product.seller?.id ?? product.sellerId ?? "",
  sellerName: product.seller?.professionalProfile?.displayName ?? `${product.seller?.firstName ?? ""} ${product.seller?.lastName ?? ""}`.trim(),
  sellerAvatar: fallbackAvatar,
  rating: product.seller?.professionalProfile?.averageRating ?? 0,
  reviewCount: product.seller?.professionalProfile?.totalReviews ?? 0,
  auction: product.auctionEnabled,
  stock: product.type === "DIGITAL" ? undefined : product.stock,
  location: product.seller?.professionalProfile?.location,
  country: product.seller?.country,
  verified: product.seller?.professionalProfile?.isVerified,
  urgent: product.isUrgent,
  featured: product.isFeatured,
  quoteOnly: product.isQuoteOnly,
  createdAt: product.createdAt,
  coordinates:
    typeof product.seller?.professionalProfile?.latitude === "number" &&
    typeof product.seller?.professionalProfile?.longitude === "number"
      ? { lat: product.seller.professionalProfile.latitude, lng: product.seller.professionalProfile.longitude }
      : undefined,
});

export const toProfessional = (professional: BackendProfessional): Professional => ({
  // Exposed id is the User.id, not the internal professionalProfile id, so
  // this matches Product.sellerId and can be used directly to start a
  // conversation (Message.senderId/receiverId are User ids).
  id: professional.user.id,
  profileId: professional.id,
  name: professional.displayName,
  specialty: professional.specialty[0] ?? "Praticien traditionnel",
  specialties: professional.specialty,
  location: professional.location,
  country: professional.user.country,
  bio: professional.biography,
  innovations: professional.innovations ?? undefined,
  communityImpact: professional.communityImpact ?? undefined,
  philosophy: professional.philosophy ?? undefined,
  avatar: professional.photos[0] ?? fallbackAvatar,
  cover: professional.photos[1] ?? professional.photos[0] ?? fallbackImage,
  gallery: professional.photos.length > 0 ? professional.photos : undefined,
  verified: professional.isVerified,
  rating: professional.averageRating,
  reviewCount: professional.totalReviews,
  socialLinks: professional.socialLinks ?? undefined,
  latitude: professional.latitude ?? undefined,
  longitude: professional.longitude ?? undefined,
  serviceBookingEnabled: professional.serviceBookingEnabled ?? false,
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
  } catch (error) {
    if (!isDev) throw error;
    console.warn("[dev] /products unreachable, falling back to sample data.", error);
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
  } catch (error) {
    if (!isDev) throw error;
    console.warn("[dev] /professionals unreachable, falling back to sample data.", error);
    return { professionals: fallbackProfessionals, pagination: undefined };
  }
};

export const getProfessionalById = async (id: string) => {
  try {
    const response = await apiRequest<BackendProfessional>(`/professionals/${id}`);
    return response.data ? toProfessional(response.data) : null;
  } catch (error) {
    if (!isDev) throw error;
    console.warn(`[dev] /professionals/${id} unreachable, falling back to sample data.`, error);
    return fallbackProfessionals.find((professional) => professional.id === id) ?? null;
  }
};

export const toMyProduct = (product: BackendProduct): MyProduct => ({
  id: product.id,
  title: product.title,
  category: product.category.replaceAll("_", " "),
  type: productTypeMap[product.type],
  price: Number(product.price),
  stock: product.stock ?? 0,
  viewCount: product.viewCount ?? 0,
  isActive: product.isActive ?? true,
  isApproved: product.isApproved ?? false,
  expiresAt: product.expiresAt ?? null,
  updatedAt: product.updatedAt ?? new Date().toISOString(),
  isFeatured: product.isFeatured ?? false,
  featuredUntil: product.featuredUntil ?? null,
  isUrgent: product.isUrgent ?? false,
  urgentUntil: product.urgentUntil ?? null,
});

export const getMyProducts = async () => {
  const response = await apiRequest<unknown>("/products/mine");
  const items = asList(response.data) as BackendProduct[];
  return items.map(toMyProduct);
};

export const renewProduct = async (id: string) => {
  const response = await apiRequest<BackendProduct>(`/products/${id}/renew`, { method: "POST" });
  return response.data ? toMyProduct(response.data) : null;
};

export const boostProduct = async (id: string) => {
  const response = await apiRequest<BackendProduct>(`/products/${id}/boost`, { method: "POST" });
  return response.data ? toMyProduct(response.data) : null;
};

export const markProductUrgent = async (id: string) => {
  const response = await apiRequest<BackendProduct>(`/products/${id}/urgent`, { method: "POST" });
  return response.data ? toMyProduct(response.data) : null;
};

export const getProductBySlug = async (slug: string) => {
  try {
    const response = await apiRequest<BackendProduct>(`/products/${slug}`);
    return response.data ? toProduct(response.data) : null;
  } catch (error) {
    if (!isDev) throw error;
    console.warn(`[dev] /products/${slug} unreachable, falling back to sample data.`, error);
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
