import type { Product } from "@/types";
import { apiRequest } from "./client";

type BackendCartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: string | number;
    images: string[];
    type: "PHYSICAL" | "SERVICE" | "DIGITAL";
    sellerId: string;
    stock: number;
  };
};

const fallbackImage = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop";

const productTypeMap = {
  PHYSICAL: "physical",
  SERVICE: "service",
  DIGITAL: "digital",
} as const;

export type ApiCartItem = {
  id: string;
  quantity: number;
  product: Product;
};

const toCartItem = (item: BackendCartItem): ApiCartItem => ({
  id: item.id,
  quantity: item.quantity,
  product: {
    id: item.product.id,
    title: item.product.title,
    category: "Marketplace",
    type: productTypeMap[item.product.type],
    price: Number(item.product.price),
    currency: "FCFA",
    image: item.product.images[0] ?? fallbackImage,
    sellerId: item.product.sellerId,
    sellerName: "Vendeur Iwosan",
    sellerAvatar: fallbackImage,
    rating: 0,
    reviewCount: 0,
  },
});

export const getCart = async () => {
  const response = await apiRequest<BackendCartItem[]>("/cart");
  return (response.data ?? []).map(toCartItem);
};

export const addCartItem = (productId: string, quantity = 1) =>
  apiRequest<BackendCartItem>("/cart", {
    method: "POST",
    body: { productId, quantity },
  });

export const updateCartItem = (itemId: string, quantity: number) =>
  apiRequest<BackendCartItem>(`/cart/${itemId}`, {
    method: "PUT",
    body: { quantity },
  });

export const deleteCartItem = (itemId: string) =>
  apiRequest<null>(`/cart/${itemId}`, {
    method: "DELETE",
  });
