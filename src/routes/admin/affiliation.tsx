import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminMlmOverview } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/affiliation")({
  head: () => ({ meta: [{ title: "Admin affiliation - IWOSAN" }] }),
  component: AdminAffiliation,
});

const typeLabel: Record<string, string> = {
  DIRECT: "Vente directe",
  MLM_LEVEL1: "Parrainage niveau 1",
  MLM_LEVEL2: "Parrainage niveau 2",
  MLM_LEVEL3: "Parrainage niveau 3",
};

function AdminAffiliation() {
  const overviewQuery = useAdminMlmOverview();
  const overview = overviewQuery.data?.data;

  const totalPaid = overview?.totalsByType.reduce((sum, row) => sum + Number(row._sum.amount ?? 0), 0) ?? 0;

  return (
    <AdminLayout title="Affiliation (MLM)" description="Réseau de parrainage, commissions distribuées et meilleurs affiliés.">
      {overviewQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {overviewQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les données d'affiliation.</p>}

      {overview && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AdminCard>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Membres du réseau</p>
              <p className="mt-3 text-[28px] font-black text-white">{overview.totalNodes.toLocaleString("fr-FR")}</p>
            </AdminCard>
            <AdminCard>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Commissions totales distribuées</p>
              <p className="mt-3 text-[28px] font-black text-white">{totalPaid.toLocaleString("fr-FR")} FCFA</p>
            </AdminCard>
            <AdminCard>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Taux configurés</p>
              <Link to="/admin/finances/commissions" className="mt-3 inline-block text-[13px] font-bold text-emerald-300">
                Voir / modifier →
              </Link>
            </AdminCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">Répartition par type de commission</h2>
              {overview.totalsByType.length === 0 ? (
                <p className="text-[13px] text-slate-400">Aucune commission distribuée pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {overview.totalsByType.map((row) => (
                    <div key={row.type} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                      <span className="text-[13px] font-semibold text-white">{typeLabel[row.type] ?? row.type}</span>
                      <span className="text-[13px] text-slate-300">{row._count.id} commission(s)</span>
                      <span className="text-[13px] font-bold text-emerald-300">{Number(row._sum.amount ?? 0).toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">Meilleurs affiliés</h2>
              {overview.topEarners.length === 0 ? (
                <p className="text-[13px] text-slate-400">Aucun affilié actif pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {overview.topEarners.map((node, index) => (
                    <div key={node.id} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[12px] font-bold text-slate-300">{index + 1}</span>
                        <div>
                          <p className="text-[13px] font-semibold text-white">{node.user.firstName} {node.user.lastName}</p>
                          <p className="text-[11px] text-slate-500">Niveau {node.level} · {node.totalDownlineCount} filleul(s) · code {node.affiliateCode}</p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-emerald-300">{Number(node.totalEarnings).toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
