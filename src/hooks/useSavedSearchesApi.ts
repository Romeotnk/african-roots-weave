import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSavedSearch,
  deleteSavedSearch,
  listMySavedSearches,
  updateSavedSearch,
} from "@/lib/api/savedSearches";

const isBrowser = typeof window !== "undefined";
const savedSearchKeys = { all: ["saved-searches", "mine"] as const };

export function useMySavedSearches() {
  return useQuery({
    queryKey: savedSearchKeys.all,
    queryFn: listMySavedSearches,
    enabled: isBrowser,
    retry: false,
  });
}

export function useSavedSearchActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: savedSearchKeys.all });
  return {
    create: useMutation({
      mutationFn: ({ name, summary }: { name: string; summary?: string }) => createSavedSearch(name, summary),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateSavedSearch(id, { isActive }),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteSavedSearch(id),
      onSuccess: refresh,
    }),
  };
}
