import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { WalletTransactionStatus, WalletTransactionType } from "@/types";
import {
  useSetWalletPin,
  useWalletBalance,
  useWalletDeposit,
  useWalletTransactions,
  useWalletTransfer,
  useWalletWithdraw,
} from "@/hooks/useWalletApi";
import { useMyOrders } from "@/hooks/useOrdersApi";
import { useMeQuery } from "@/hooks/useAuthApi";

export const Route = createFileRoute("/mon-compte/portefeuille")({
  head: () => ({ meta: [{ title: "Portefeuille - IWOSAN" }] }),
  component: WalletPage,
});

function buildTypeLabels(t: TFunction): Record<WalletTransactionType, string> {
  return {
    deposit: t("account.wallet.typeDeposit"),
    withdrawal: t("account.wallet.typeWithdrawal"),
    payment: t("account.wallet.typePayment"),
    reception: t("account.wallet.typeReception"),
    refund: t("account.wallet.typeRefund"),
    commission: t("account.wallet.typeCommission"),
  };
}

function buildStatusLabels(t: TFunction): Record<WalletTransactionStatus, string> {
  return {
    pending: t("account.wallet.statusPending"),
    completed: t("account.wallet.statusCompleted"),
    failed: t("account.wallet.statusFailed"),
  };
}

const statusClasses: Record<WalletTransactionStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

type WalletDialog = "deposit" | "withdraw" | "transfer" | "pin" | null;

function WalletPage() {
  const { t } = useTranslation();
  const typeLabels = buildTypeLabels(t);
  const statusLabels = buildStatusLabels(t);
  const [dialog, setDialog] = useState<WalletDialog>(null);
  const [typeFilter, setTypeFilter] = useState<WalletTransactionType | "all">("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [walletForm, setWalletForm] = useState({
    amount: "",
    method: "mobile_money",
    destination: "",
    receiver: "",
  });
  const meQuery = useMeQuery();
  const hasWalletPin = Boolean(meQuery.data?.hasWalletPin);
  const remoteBalance = useWalletBalance();
  const remoteTransactions = useWalletTransactions();
  const sellerOrdersQuery = useMyOrders("seller");
  const deposit = useWalletDeposit();
  const withdraw = useWalletWithdraw();
  const transfer = useWalletTransfer();
  const setPinMutation = useSetWalletPin();
  const displayedTransactions = remoteTransactions.data ?? [];
  // "Pending escrow" = funds from paid-but-not-yet-delivered orders: the
  // buyer has paid but the seller hasn't confirmed delivery yet, so the
  // amount isn't in walletBalance. "Lifetime" = every credit this wallet has
  // ever received (deposits, commissions, reception), independent of the
  // current spendable balance.
  const sellerOrders = (sellerOrdersQuery.data?.data ?? []) as { totalAmount: string | number; status: string }[];
  const pendingEscrow = sellerOrders
    .filter((order) => ["PAID", "SHIPPED"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const lifetimeEarned = displayedTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const displayedSummary = {
    available: remoteBalance.data ?? 0,
    pending: pendingEscrow,
    lifetime: lifetimeEarned,
    currency: "FCFA",
  };

  const filteredTransactions = useMemo(
    () =>
      displayedTransactions.filter((transaction) => {
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;
        const txDate = new Date(transaction.date).getTime();
        const now = Date.now();
        const matchesPeriod =
          periodFilter === "week"
            ? now - txDate <= 7 * 24 * 60 * 60 * 1000
            : periodFilter === "month"
              ? now - txDate <= 31 * 24 * 60 * 60 * 1000
              : true;
        return matchesType && matchesPeriod;
      }),
    [displayedTransactions, periodFilter, typeFilter],
  );

  const closeDialog = (message?: string) => {
    setDialog(null);
    setPin("");
    setCurrentPin("");
    setWalletForm({ amount: "", method: "mobile_money", destination: "", receiver: "" });
    if (message) setActionMessage(message);
  };

  const submitWalletAction = async () => {
    if (dialog === "pin") {
      try {
        await setPinMutation.mutateAsync({ pin, currentPin: hasWalletPin ? currentPin : undefined });
        closeDialog(hasWalletPin ? t("account.wallet.pinUpdated") : t("account.wallet.pinConfigured"));
      } catch (error) {
        setActionMessage(error instanceof Error ? error.message : t("account.wallet.pinSaveError"));
      }
      return;
    }

    const amount = Number(walletForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionMessage(t("account.wallet.invalidAmount"));
      return;
    }

    try {
      if (dialog === "deposit") {
        await deposit.mutateAsync({ amount, method: walletForm.method });
        closeDialog(t("account.wallet.depositInitiated"));
        return;
      }
      if (dialog === "withdraw") {
        await withdraw.mutateAsync({ amount, destination: walletForm.destination || t("account.wallet.defaultDestination"), pin: hasWalletPin ? pin : undefined });
        closeDialog(t("account.wallet.withdrawSent"));
        return;
      }
      if (dialog === "transfer") {
        if (!walletForm.receiver.trim()) {
          setActionMessage(t("account.wallet.receiverRequired"));
          return;
        }
        await transfer.mutateAsync({ amount, receiver: walletForm.receiver.trim(), pin: hasWalletPin ? pin : undefined });
        closeDialog(t("account.wallet.transferDone"));
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : t("account.wallet.actionError"));
    }
  };

  const exportCsv = () => {
    const rows = [
      t("account.wallet.csvHeader"),
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
    <AccountLayout
      title={t("account.wallet.title")}
      description={t("account.wallet.description")}
    >
      <div className="space-y-6">
        <div className="rounded-[16px] bg-[var(--brand-primary)] p-7 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-white/70 text-[13px] font-semibold uppercase tracking-wider">
                {t("account.wallet.availableBalance")}
              </p>
              <p className="mt-2 text-[42px] font-extrabold md:text-[56px]">
                {displayedSummary.available.toLocaleString("fr-FR")} {displayedSummary.currency}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Info size={14} /> {t("account.wallet.pendingEscrow", { amount: displayedSummary.pending.toLocaleString("fr-FR") })}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {t("account.wallet.totalEarned", { amount: displayedSummary.lifetime.toLocaleString("fr-FR") })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setDialog("deposit")} className="rounded-[12px] bg-white px-4 py-3 text-[13px] font-bold text-[var(--brand-primary)]">
                <ArrowDownToLine className="mx-auto mb-1" size={18} /> {t("account.wallet.deposit")}
              </button>
              <button onClick={() => setDialog("withdraw")} className="rounded-[12px] bg-white/10 px-4 py-3 text-[13px] font-bold">
                <ArrowUpFromLine className="mx-auto mb-1" size={18} /> {t("account.wallet.withdraw")}
              </button>
              <button onClick={() => setDialog("transfer")} className="rounded-[12px] bg-white/10 px-4 py-3 text-[13px] font-bold">
                <Send className="mx-auto mb-1" size={18} /> {t("account.wallet.transfer")}
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
              <h2 className="font-bold">{t("account.wallet.transactionHistory")}</h2>
              <div className="flex flex-wrap gap-2">
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as WalletTransactionType | "all")} className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-3 text-[13px]">
                  <option value="all">{t("account.wallet.allTypes")}</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-3 text-[13px]">
                  <option value="all">{t("account.wallet.allPeriods")}</option>
                  <option value="week">{t("account.wallet.sevenDays")}</option>
                  <option value="month">{t("account.wallet.thirtyDays")}</option>
                </select>
                {(typeFilter !== "all" || periodFilter !== "all") && (
                  <button onClick={() => { setTypeFilter("all"); setPeriodFilter("all"); }} className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">{t("account.wallet.reset")}</button>
                )}
                <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                  <Download size={15} /> {t("account.wallet.csv")}
                </button>
              </div>
            </div>
            <div className="divide-y divide-[var(--brand-border-light)]">
              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[var(--color-text-muted)]">{t("account.wallet.noTransactions")}</div>
              )}
              {filteredTransactions.map((transaction) => (
                <article key={transaction.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                      <Wallet size={17} />
                    </div>
                    <div>
                      <p className="font-bold">{transaction.label}</p>
                      <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                        {transaction.note
                          ? t("account.wallet.transactionMetaWithNote", { date: transaction.date, type: typeLabels[transaction.type], note: transaction.note })
                          : t("account.wallet.transactionMeta", { date: transaction.date, type: typeLabels[transaction.type] })}
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
              <h2 className="font-bold">{t("account.wallet.walletSecurity")}</h2>
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    {hasWalletPin ? t("account.wallet.pinActive") : t("account.wallet.pinNotConfigured")}
                  </p>
                </div>
              </div>
              <button onClick={() => setDialog("pin")} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold">
                <LockKeyhole size={15} /> {hasWalletPin ? t("account.wallet.editPin") : t("account.wallet.configurePin")}
              </button>
            </div>
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] text-[var(--color-text-secondary)]">
              {t("account.wallet.escrowNotice")}
            </div>
          </aside>
        </div>
      </div>

      <WalletActionDialog
        dialog={dialog}
        availableBalance={displayedSummary.available}
        hasWalletPin={hasWalletPin}
        pin={pin}
        setPin={setPin}
        currentPin={currentPin}
        setCurrentPin={setCurrentPin}
        walletForm={walletForm}
        setWalletForm={setWalletForm}
        onClose={closeDialog}
        onConfirm={submitWalletAction}
        isPending={deposit.isPending || withdraw.isPending || transfer.isPending || setPinMutation.isPending}
      />
    </AccountLayout>
    </ProtectedRoute>
  );
}

function WalletActionDialog({
  dialog,
  availableBalance,
  hasWalletPin,
  pin,
  setPin,
  currentPin,
  setCurrentPin,
  walletForm,
  setWalletForm,
  onClose,
  onConfirm,
  isPending,
}: {
  dialog: WalletDialog;
  availableBalance: number;
  hasWalletPin: boolean;
  pin: string;
  setPin: (value: string) => void;
  currentPin: string;
  setCurrentPin: (value: string) => void;
  walletForm: { amount: string; method: string; destination: string; receiver: string };
  setWalletForm: (value: { amount: string; method: string; destination: string; receiver: string }) => void;
  onClose: (message?: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  // A PIN is only ever required for: setting/changing it (dialog === "pin"),
  // and confirming a withdraw/transfer once the user has opted in by setting
  // one. Deposits never need it (money coming in, nothing to protect), and
  // withdraw/transfer skip the field entirely when no PIN has been
  // configured yet — matching the backend's opt-in enforcement exactly.
  const needsPinField = dialog === "pin" || ((dialog === "withdraw" || dialog === "transfer") && hasWalletPin);
  const needsCurrentPinField = dialog === "pin" && hasWalletPin;
  const pinReady = (!needsPinField || pin.length === 6) && (!needsCurrentPinField || currentPin.length === 6);
  const title =
    dialog === "deposit"
      ? t("account.wallet.depositTitle")
      : dialog === "withdraw"
        ? t("account.wallet.withdrawTitle")
        : dialog === "transfer"
          ? t("account.wallet.transferTitle")
          : t("account.wallet.pinTitle");

  return (
    <Dialog open={Boolean(dialog)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("account.wallet.dialogDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {dialog === "deposit" && (
            <>
              <input
                type="number"
                min="1"
                placeholder={t("account.wallet.amountPlaceholder")}
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <select
                value={walletForm.method}
                onChange={(event) => setWalletForm({ ...walletForm, method: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
              >
                <option value="mobile_money">{t("account.wallet.mobileMoney")}</option>
                <option value="card">{t("account.wallet.card")}</option>
              </select>
              <p className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">{t("account.wallet.ussdNotice")}</p>
            </>
          )}
          {dialog === "withdraw" && (
            <>
              <p className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">{t("account.wallet.availableBalanceNotice", { amount: availableBalance.toLocaleString("fr-FR") })}</p>
              <input
                type="number"
                min="1"
                placeholder={t("account.wallet.withdrawAmountPlaceholder")}
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <input
                placeholder={t("account.wallet.destinationPlaceholder")}
                value={walletForm.destination}
                onChange={(event) => setWalletForm({ ...walletForm, destination: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <p className="text-[13px] text-[var(--color-text-muted)]">{t("account.wallet.withdrawDelay")}</p>
            </>
          )}
          {dialog === "transfer" && (
            <>
              <input
                placeholder={t("account.wallet.receiverPlaceholder")}
                value={walletForm.receiver}
                onChange={(event) => setWalletForm({ ...walletForm, receiver: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
              <input
                type="number"
                min="1"
                placeholder={t("account.wallet.amountPlaceholder")}
                value={walletForm.amount}
                onChange={(event) => setWalletForm({ ...walletForm, amount: event.target.value })}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
              />
            </>
          )}
          {needsCurrentPinField && (
            <div>
              <p className="mb-2 text-[13px] font-semibold">{t("account.wallet.currentPin")}</p>
              <InputOTP maxLength={6} value={currentPin} onChange={setCurrentPin}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          {needsPinField && (
            <div>
              <p className="mb-2 text-[13px] font-semibold">{dialog === "pin" ? t("account.wallet.newPin") : t("account.wallet.confirmPin")}</p>
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          <button
            onClick={onConfirm}
            disabled={isPending || !dialog || !pinReady}
            className="h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-70"
          >
            {isPending ? t("account.wallet.processing") : !pinReady ? t("account.wallet.pinRequired") : t("account.wallet.confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
