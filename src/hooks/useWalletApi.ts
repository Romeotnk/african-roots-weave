import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWalletBalance,
  getWalletTransactions,
  initiateWalletDeposit,
  requestWalletWithdraw,
  setWalletPin,
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
    mutationFn: ({ amount, destination, pin }: { amount: number; destination: string; pin?: string }) =>
      requestWalletWithdraw(amount, destination, pin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}

export function useWalletTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ receiver, amount, pin }: { receiver: string; amount: number; pin?: string }) =>
      transferWalletFunds(receiver, amount, pin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}

export function useSetWalletPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pin, currentPin }: { pin: string; currentPin?: string }) => setWalletPin(pin, currentPin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}
