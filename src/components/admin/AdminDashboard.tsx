import { Link } from "@tanstack/react-router";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminDashboard, usePendingArticles, usePendingProducts } from "@/hooks/useAdminApi";

export function AdminDashboard() {
  const dashboardQuery = useAdminDashboard();
  const pendingProductsQuery = usePendingProducts();
  const pendingArticlesQuery = usePendingArticles();

  const stats = dashboardQuery.data?.data;
  const pendingProductsCount = pendingProductsQuery.data?.data?.length ?? 0;
  const pendingArticlesCount = pendingArticlesQuery.data?.data?.length ?? 0;

  const kpis = stats
    ? [
        { label: "Utilisateurs", value: stats.totalUsers.toLocaleString("fr-FR") },
        { label: "Nouveaux aujourd'hui", value: stats.newUsersToday.toLocaleString("fr-FR") },
        { label: "Annonces actives", value: stats.activeListings.toLocaleString("fr-FR") },
        { label: "Revenu (30j, commissions)", value: `${Number(stats.revenue ?? 0).toLocaleString("fr-FR")} FCFA` },
        { label: "KYC en attente", value: stats.pendingKYC, urgent: stats.pendingKYC > 0 },
        { label: "Tickets ouverts", value: stats.openTickets, urgent: stats.openTickets > 0 },
      ]
    : [];

  const urgentActions = [
    { label: "KYC en attente", to: "/admin/utilisateurs/kyc", count: stats?.pendingKYC ?? 0 },
    { label: "Annonces à modérer", to: "/admin/marketplace", count: pendingProductsCount },
    { label: "Articles à modérer", to: "/admin/contenus", count: pendingArticlesCount },
    { label: "Tickets ouverts", to: "/admin/communication/tickets", count: stats?.openTickets ?? 0 },
  ].filter((action) => action.count > 0);

  return (
    <AdminLayout title="Vue d'ensemble" description="Pilotage opérationnel de la plateforme.">
      {dashboardQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {dashboardQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les statistiques.</p>}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <AdminCard key={kpi.label}>
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
                <p className="mt-3 text-[28px] font-black text-white">{kpi.value}</p>
                {"urgent" in kpi && (
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${kpi.urgent ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {kpi.urgent ? "À traiter" : "OK"}
                  </span>
                )}
              </AdminCard>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">Top catégories (annonces)</h2>
              {stats.topCategories.length === 0 ? (
                <p className="text-[13px] text-slate-400">Aucune annonce publiée pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topCategories.map((row) => {
                    const max = Math.max(...stats.topCategories.map((item) => item._count.id));
                    return (
                      <div key={row.category} className="flex items-center gap-3">
                        <span className="w-40 truncate text-[13px] text-slate-300">{row.category.replaceAll("_", " ")}</span>
                        <div className="h-3 flex-1 rounded-full bg-white/10"><div className="h-3 rounded-full bg-amber-300" style={{ width: `${(row._count.id / max) * 100}%` }} /></div>
                        <span className="w-8 text-right text-[12px]">{row._count.id}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminCard>

            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">À traiter</h2>
              {urgentActions.length === 0 ? (
                <p className="text-[13px] text-slate-400">Rien à traiter pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {urgentActions.map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-[13px] font-semibold hover:bg-white/10">
                      <span>{item.label}</span>
                      <span className="rounded-full bg-red-500 px-2 py-1 text-[11px]">{item.count}</span>
                    </Link>
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
