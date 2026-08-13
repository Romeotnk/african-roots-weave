import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTransactions } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/finances/transactions")({
  head: () => ({ meta: [{ title: "Admin transactions - IWOSAN" }] }),
  component: AdminTransactions,
});

function AdminTransactions() {
  const { t } = useTranslation();
  const typeLabel: Record<string, string> = {
    DEPOSIT: t("admin.transactions.typeDeposit"),
    WITHDRAWAL: t("admin.transactions.typeWithdrawal"),
    COMMISSION: t("admin.transactions.typeCommission"),
    PAYMENT: t("admin.transactions.typePayment"),
    REFUND: t("admin.transactions.typeRefund"),
    TRANSFER: t("admin.transactions.typeTransfer"),
  };
  const transactionsQuery = useAdminTransactions();
  const transactions = transactionsQuery.data?.data ?? [];

  return (
    <AdminLayout title={t("admin.transactions.title")} description={t("admin.transactions.description")}>
      {transactionsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.transactions.loading")}</p>}
      {transactionsQuery.isError && <p className="text-[13px] text-red-300">{t("admin.transactions.loadError")}</p>}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.transactions.colDate"), t("admin.transactions.colUser"), t("admin.transactions.colType"), t("admin.transactions.colAmount"), t("admin.transactions.colBalanceAfter"), t("admin.transactions.colReference")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.transactions.noTransactions")}</td></tr>
              )}
              {transactions.map((tx) => {
                const amount = Number(tx.amount);
                return (
                  <tr key={tx.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-slate-200">{new Date(tx.createdAt).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-semibold text-white">{tx.user.firstName} {tx.user.lastName}</td>
                    <td className="px-4 py-3 text-slate-200">{typeLabel[tx.type] ?? tx.type}</td>
                    <td className={`px-4 py-3 font-bold ${amount < 0 ? "text-red-300" : "text-emerald-300"}`}>
                      {amount > 0 ? "+" : ""}{amount.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-4 py-3 text-slate-200">{Number(tx.balanceAfter).toLocaleString("fr-FR")} FCFA</td>
                    <td className="px-4 py-3 text-slate-500">{tx.reference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
