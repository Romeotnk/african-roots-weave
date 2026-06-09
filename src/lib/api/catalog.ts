import type { Product, Professional } from "@/types";
import { apiRequest } from "./client";

type BackendProduct = {
  id: string;
  title: string;
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

export const toProduct = (product: BackendProduct): Product => ({
  id: product.id,
  title: product.title,
  category: product.category.replaceAll("_", " "),
  type: productTypeMap[product.type],
  price: Number(product.price),
  currency: "FCFA",
  image: product.images[0] ?? fallbackImage,
  sellerId: product.seller?.id ?? product.sellerId ?? "",
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
  const response = await apiRequest<BackendProduct[]>(`/products${query ? `?${query}` : ""}`);
  return {
    products: (response.data ?? []).map(toProduct),
    pagination: response.pagination,
  };
};

export const getProfessionals = async (params: URLSearchParams) => {
  const query = params.toString();
  const response = await apiRequest<BackendProfessional[]>(`/professionals${query ? `?${query}` : ""}`);
  return {
    professionals: (response.data ?? []).map(toProfessional),
    pagination: response.pagination,
  };
};
