import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTransactions } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/finances/transactions")({
  head: () => ({ meta: [{ title: "Admin transactions - IWOSAN" }] }),
  component: AdminTransactions,
});

const typeLabel: Record<string, string> = {
  DEPOSIT: "Dépôt",
  WITHDRAWAL: "Retrait",
  COMMISSION: "Commission",
  PAYMENT: "Paiement",
  REFUND: "Remboursement",
  TRANSFER: "Transfert",
};

function AdminTransactions() {
  const transactionsQuery = useAdminTransactions();
  const transactions = transactionsQuery.data?.data ?? [];

  return (
    <AdminLayout title="Transactions" description="Historique des mouvements du portefeuille Iwosan.">
      {transactionsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {transactionsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les transactions.</p>}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Date", "Utilisateur", "Type", "Montant", "Solde après", "Référence"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucune transaction.</td></tr>
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
