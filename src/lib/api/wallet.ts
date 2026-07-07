import type { WalletTransaction, WalletTransactionStatus, WalletTransactionType } from "@/types";
import { apiRequest } from "./client";

type BackendWalletTransaction = {
  id: string;
  amount: string | number;
  type: string;
  reference: string;
  description?: string | null;
  createdAt: string;
};

const typeMap: Record<string, WalletTransactionType> = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  PAYMENT: "payment",
  TRANSFER: "payment",
  REFUND: "refund",
  COMMISSION: "commission",
};

const toWalletTransaction = (transaction: BackendWalletTransaction): WalletTransaction => ({
  id: transaction.id,
  date: transaction.createdAt.slice(0, 10),
  type: typeMap[transaction.type] ?? "payment",
  label: transaction.description ?? transaction.reference,
  amount: Number(transaction.amount),
  status: "completed" satisfies WalletTransactionStatus,
  note: transaction.reference,
});

export const getWalletBalance = async () => {
  const response = await apiRequest<{ balance: string | number }>("/wallet/balance");
  return Number(response.data?.balance ?? 0);
};

export const getWalletTransactions = async () => {
  const response = await apiRequest<BackendWalletTransaction[]>("/wallet/transactions");
  return (response.data ?? []).map(toWalletTransaction);
};

export const initiateWalletDeposit = (amount: number, method?: string) =>
  apiRequest<unknown>("/wallet/deposit", {
    method: "POST",
    body: { amount, method },
  });

export const requestWalletWithdraw = (amount: number, destination: string) =>
  apiRequest<unknown>("/wallet/withdraw", {
    method: "POST",
    body: { amount, destination },
  });

export const transferWalletFunds = (receiver: string, amount: number) =>
  apiRequest<{ reference: string }>("/wallet/transfer", {
    method: "POST",
    body: receiver.includes("@") ? { receiverEmail: receiver, amount } : { receiverId: receiver, amount },
  });
