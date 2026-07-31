import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTaxonomy,
  deleteTaxonomy,
  listAdminTaxonomy,
  listTaxonomy,
  updateTaxonomy,
  type TaxonomyScope,
} from "@/lib/api/taxonomy";

const isAdmin = () => typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export function useTaxonomy(scope: TaxonomyScope) {
  return useQuery({
    queryKey: ["taxonomy", scope],
    queryFn: () => listTaxonomy(scope),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTaxonomy(scope: TaxonomyScope) {
  return useQuery({
    queryKey: ["admin", "taxonomy", scope],
    queryFn: () => listAdminTaxonomy(scope),
    enabled: isAdmin(),
    retry: false,
  });
}

export function useTaxonomyActions(scope: TaxonomyScope) {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "taxonomy", scope] });
    queryClient.invalidateQueries({ queryKey: ["taxonomy", scope] });
  };
  return {
    create: useMutation({
      mutationFn: (name: string) => createTaxonomy(scope, name),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) => updateTaxonomy(id, { name }),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteTaxonomy(id),
      onSuccess: refresh,
    }),
  };
}
