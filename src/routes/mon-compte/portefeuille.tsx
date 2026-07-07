import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
  Info,
  LockKeyhole,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { walletSummary, walletTransactions } from "@/data/wallet";
import type { WalletTransactionStatus, WalletTransactionType } from "@/types";
import {
  useWalletBalance,
  useWalletDeposit,
  useWalletTransactions,
  useWalletTransfer,
  useWalletWithdraw,
} from "@/hooks/useWalletApi";

export const Route = createFileRoute("/mon-compte/portefeuille")({
  head: () => ({ meta: [{ title: "Portefeuille - IWOSAN" }] }),
  component: WalletPage,
});

const typeLabels: Record<WalletTransactionType, string> = {
  deposit: "Depot",
  withdrawal: "Retrait",
  payment: "Paiement",
  reception: "Reception",
  refund: "Remboursement",
  commission: "Commission",
};

const statusLabels: Record<WalletTransactionStatus, string> = {
  pending: "En attente",
  completed: "Complete",
  failed: "Echoue",
};

const statusClasses: Record<WalletTransactionStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

type WalletDialog = "deposit" | "withdraw" | "transfer" | "pin" | null;

function WalletPage() {
  const [dialog, setDialog] = useState<WalletDialog>(null);
  const [typeFilter, setTypeFilter] = useState<WalletTransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<WalletTransactionStatus | "all">("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [pin, setPin] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [walletForm, setWalletForm] = useState({
    amount: "",
    method: "mobile_money",
    destination: "",
    receiver: "",
  });
  const remoteBalance = useWalletBalance();
  const remoteTransactions = useWalletTransactions();
  const deposit = useWalletDeposit();
  const withdraw = useWalletWithdraw();
  const transfer = useWalletTransfer();
  const displayedSummary = {
    ...walletSummary,
    available: remoteBalance.data ?? walletSummary.available,
  };
  const displayedTransactions = remoteTransactions.data?.length ? remoteTransactions.data : walletTransactions;

  const filteredTransactions = useMemo(
    () =>
      displayedTransactions.filter((transaction) => {
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;
        const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
        const txDate = new Date(transaction.date).getTime();
        const now = new Date("2026-06-15").getTime();
        const matchesPeriod =
          periodFilter === "week"
            ? now - txDate <= 7 * 24 * 60 * 60 * 1000
            : periodFilter === "month"
              ? now - txDate <= 31 * 24 * 60 * 60 * 1000
              : true;
        return matchesType && matchesStatus && matchesPeriod;
      }),
    [displayedTransactions, periodFilter, statusFilter, typeFilter],
  );

  const closeDialog = (message?: string) => {
    setDialog(null);
    setPin("");
    setWalletForm({ amount: "", method: "mobile_money", destination: "", receiver: "" });
    if (message) setActionMessage(message);
  };

  const submitWalletAction = async () => {
    if (dialog === "pin") {
      closeDialog("PIN enregistre pour cette session.");
      return;
    }

    const amount = Number(walletForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionMessage("Indiquez un montant valide.");
      return;
    }

    try {
      if (dialog === "deposit") {
        await deposit.mutateAsync({ amount, method: walletForm.method });
        closeDialog("Depot initialise. Suivez les instructions de paiement recues.");
        return;
      }
      if (dialog === "withdraw") {
        await withdraw.mutateAsync({ amount, destination: walletForm.destination || "Destination principale" });
        closeDialog("Demande de retrait envoyee a l'administration.");
        return;
      }
      if (dialog === "transfer") {
        if (!walletForm.receiver.trim()) {
          setActionMessage("Indiquez l'email ou l'identifiant du destinataire.");
          return;
        }
        await transfer.mutateAsync({ amount, receiver: walletForm.receiver.trim() });
        closeDialog("Transfert effectue.");
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Action portefeuille impossible.");
    }
  };

  const exportCsv = () => {
    const rows = [
      "date,type,label,montant,statut",
      ...filteredTransactions.map((transaction) =>
        [
          transaction.date,
          typeLabels[transaction.type],
          transaction.label,
          transaction.amount,
          statusLabels[transaction.status],
        ].join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions-iwosan.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            Mon compte
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Portefeuille Iwosan</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Solde, transactions, depot, retrait et transfert lies a votre compte connecte.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8 space-y-6">
        <div className="rounded-[16px] bg-[var(--brand-primary)] p-7 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-white/70 text-[13px] font-semibold uppercase tracking-wider">
                Solde disponible
              </p>
              <p className="mt-2 text-[42px] font-extrabold md:text-[56px]">
                {displayedSummary.available.toLocaleString("fr-FR")} {displayedSummary.currency}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Info size={14} /> En attente escrow: {displayedSummary.pending.toLocaleString("fr-FR")} FCFA
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Total gagne: {displayedSummary.lifetime.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setDialog("deposit")} className="rounded-[12px] bg-white px-4 py-3 text-[13px] font-bold text-[var(--brand-primary)]">
                <ArrowDownToLine className="mx-auto mb-1" size={18} /> Deposer
              </button>
              <button onClick={() => setDialog("withdraw")} className="rounded-[12px] bg-white/10 px-4 py-3 text-[13px] font-bold">
                <ArrowUpFromLine className="mx-auto mb-1" size={18} /> Retirer
              </button>
              <button onClick={() => setDialog("transfer")} className="rounded-[12px] bg-white/10 px-4 py-3 text-[13px] font-bold">
                <Send className="mx-auto mb-1" size={18} /> Transferer
              </button>
            </div>
          </div>
        </div>

        {actionMessage && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white">
            <div className="flex flex-col gap-3 border-b border-[var(--brand-border-light)] p-5 md:flex-row md:items-center md:justify-between">
              <h2 className="font-bold">Historique des transactions</h2>
              <div className="flex flex-wrap gap-2">
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as WalletTransactionType | "all")} className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-3 text-[13px]">
                  <option value="all">Tous types</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-3 text-[13px]">
                  <option value="all">Toute periode</option>
                  <option value="week">7 jours</option>
                  <option value="month">30 jours</option>
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as WalletTransactionStatus | "all")} className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-3 text-[13px]">
                  <option value="all">Tous statuts</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                  <Download size={15} /> CSV
                </button>
              </div>
            </div>
            <div className="divide-y divide-[var(--brand-border-light)]">
              {filteredTransactions.map((transaction) => (
                <article key={transaction.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                      <Wallet size={17} />
                    </div>
                    <div>
                      <p className="font-bold">{transaction.label}</p>
                      <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                        {transaction.date} - {typeLabels[transaction.type]}{transaction.note ? ` - ${transaction.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-extrabold ${transaction.amount >= 0 ? "text-emerald-700" : "text-[var(--color-text-primary)]"}`}>
                      {transaction.amount >= 0 ? "+" : ""}{transaction.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${statusClasses[transaction.status]}`}>
                      {statusLabels[transaction.status]}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[var(--brand-primary)]" size={24} />
                <div>
                  <h2 className="font-bold">Securite du portefeuille</h2>
                  <p className="text-[12px] text-[var(--color-text-muted)]">PIN requis pour les actions sensibles.</p>
                </div>
              </div>
              <button onClick={() => setDialog("pin")} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold">
                <LockKeyhole size={15} /> Configurer PIN
              </button>
            </div>
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] text-[var(--color-text-secondary)]">
              Les fonds sous escrow sont affiches en attente jusqu'a confirmation de reception par l'acheteur.
            </div>
          </aside>
        </div>
      </section>

      <WalletActionDialog
        dialog={dialog}
        pin={pin}
        setPin={setPin}
        walletForm={walletForm}
        setWalletForm={setWalletForm}
        onClose={closeDialog}
        onConfirm={submitWalletAction}
        isPending={deposit.isPending || withdraw.isPending || transfer.isPending}
      />
    </main>
    </ProtectedRoute>
  );
}

function WalletActionDialog({
  dialog,
  pin,
  setPin,
  walletForm,
  setWalletForm,
  onClose,
  onConfirm,
  isPending,
}: {
  dialog: WalletDialog;
  pin: string;
  setPin: (value: string) => void;
  walletForm: { amount: string; method: string; destination: string; receiver: string };
  setWalletForm: (value: { amount: string; method: string; destination: string; receiver: string }) => void;
  onClose: (message?: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const title =
    dialog === "deposit"
      ? "Deposer des fonds"
      : dialog === "withdraw"
        ? "Retirer des fonds"
        : dialog === "transfer"
          ? "Transferer"
          : "Configurer le PIN";

  return (
    <Dialog open={Boolean(dialog)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Les actions sont envoyees au backend IWOSAN du compte connecte.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {dialog === "deposit" && (
            <>
              <input
                type="number"
                min="1"
                placeholder="Montant"
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <select
                value={walletForm.method}
                onChange={(event) => setWalletForm({ ...walletForm, method: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
              >
                <option value="mobile_money">Mobile money</option>
                <option value="card">Carte bancaire</option>
              </select>
              <p className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">Confirmez ensuite la demande USSD sur votre telephone.</p>
            </>
          )}
          {dialog === "withdraw" && (
            <>
              <p className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">Solde disponible: {walletSummary.available.toLocaleString("fr-FR")} FCFA</p>
              <input
                type="number"
                min="1"
                placeholder="Montant a retirer"
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <input
                placeholder="Destination de paiement"
                value={walletForm.destination}
                onChange={(event) => setWalletForm({ ...walletForm, destination: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <p className="text-[13px] text-[var(--color-text-muted)]">Delai estime: 1-3 jours ouvrables.</p>
            </>
          )}
          {dialog === "transfer" && (
            <>
              <input
                placeholder="Email ou identifiant IWOSAN"
                value={walletForm.receiver}
                onChange={(event) => setWalletForm({ ...walletForm, receiver: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <input
                type="number"
                min="1"
                placeholder="Montant"
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
            </>
          )}
          <div>
            <p className="mb-2 text-[13px] font-semibold">{dialog === "pin" ? "Nouveau PIN" : "Confirmation PIN"}</p>
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-70"
          >
            {isPending ? "Traitement..." : "Confirmer"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
