import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWalletBalance,
  getWalletTransactions,
  initiateWalletDeposit,
  requestWalletWithdraw,
  transferWalletFunds,
} from "@/lib/api/wallet";

export const walletKeys = {
  balance: ["wallet", "balance"] as const,
  transactions: ["wallet", "transactions"] as const,
};

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

export function useWalletBalance() {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: getWalletBalance,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: walletKeys.transactions,
    queryFn: getWalletTransactions,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useWalletDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, method }: { amount: number; method?: string }) => initiateWalletDeposit(amount, method),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}

export function useWalletWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, destination }: { amount: number; destination: string }) => requestWalletWithdraw(amount, destination),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}

export function useWalletTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ receiver, amount }: { receiver: string; amount: number }) => transferWalletFunds(receiver, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}
