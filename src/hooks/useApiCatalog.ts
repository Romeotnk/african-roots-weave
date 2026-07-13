import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProducts,
  getProfessionalById,
  getProfessionals,
  listProductBids,
  placeProductBid,
  updateProduct,
  uploadProductImages,
  type ProductPayload,
  type UpdateProductPayload,
} from "@/lib/api/catalog";

const isBrowser = typeof window !== "undefined";

export const catalogKeys = {
  products: (query: string) => ["products", query] as const,
  product: (slug: string) => ["products", "detail", slug] as const,
  productBids: (id: string) => ["products", "bids", id] as const,
  professionals: (query: string) => ["professionals", query] as const,
  professional: (id: string) => ["professionals", "detail", id] as const,
};

export function useProducts(params: URLSearchParams) {
  const query = params.toString();
  return useQuery({
    queryKey: catalogKeys.products(query),
    queryFn: () => getProducts(params),
    enabled: isBrowser,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useProfessionals(params: URLSearchParams) {
  const query = params.toString();
  return useQuery({
    queryKey: catalogKeys.professionals(query),
    queryFn: () => getProfessionals(params),
    enabled: isBrowser,
  });
}

export function useProfessional(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.professional(id),
    queryFn: () => getProfessionalById(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUploadProductImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => uploadProductImages(id, files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useProductBids(id: string) {
  return useQuery({
    queryKey: catalogKeys.productBids(id),
    queryFn: () => listProductBids(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function usePlaceProductBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => placeProductBid(id, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.productBids(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}