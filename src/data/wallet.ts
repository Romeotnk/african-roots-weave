import type { WalletTransaction } from "@/types";

export const walletSummary = {
  available: 186500,
  pending: 42000,
  lifetime: 1248500,
  currency: "FCFA",
};

export const walletTransactions: WalletTransaction[] = [
  {
    id: "tx1",
    date: "2026-06-14",
    type: "reception",
    label: "Vente tisane post-partum",
    amount: 8500,
    status: "completed",
    note: "Commande CMD-2026-1048",
  },
  {
    id: "tx2",
    date: "2026-06-13",
    type: "commission",
    label: "Commission plateforme",
    amount: -850,
    status: "completed",
  },
  {
    id: "tx3",
    date: "2026-06-12",
    type: "deposit",
    label: "Depot Mobile Money",
    amount: 50000,
    status: "completed",
  },
  {
    id: "tx4",
    date: "2026-06-10",
    type: "payment",
    label: "Achat ebook Atlas plantes",
    amount: -12000,
    status: "completed",
  },
  {
    id: "tx5",
    date: "2026-06-08",
    type: "withdrawal",
    label: "Retrait Wave",
    amount: -30000,
    status: "pending",
    note: "Delai estime 1-3 jours ouvrables",
  },
  {
    id: "tx6",
    date: "2026-06-04",
    type: "refund",
    label: "Remboursement commande annulee",
    amount: 6500,
    status: "completed",
  },
];
