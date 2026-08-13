import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminDashboard, usePendingArticles, usePendingEvents, usePendingFormations, usePendingProducts, usePendingProfessionals } from "@/hooks/useAdminApi";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const { t } = useTranslation();
  const dashboardQuery = useAdminDashboard();
  const pendingProductsQuery = usePendingProducts();
  const pendingArticlesQuery = usePendingArticles();
  const pendingEventsQuery = usePendingEvents();
  const pendingFormationsQuery = usePendingFormations();
  const pendingProfessionalsQuery = usePendingProfessionals();

  const stats = dashboardQuery.data?.data;
  const pendingProductsCount = pendingProductsQuery.data?.data?.length ?? 0;
  const pendingArticlesCount = pendingArticlesQuery.data?.data?.length ?? 0;
  const pendingEventsCount = pendingEventsQuery.data?.data?.length ?? 0;
  const pendingFormationsCount = pendingFormationsQuery.data?.data?.length ?? 0;
  const pendingProfessionalsCount = pendingProfessionalsQuery.data?.data?.length ?? 0;

  const kpis = stats
    ? [
        { label: t("admin.overview.kpiUsers"), value: stats.totalUsers.toLocaleString("fr-FR") },
        { label: t("admin.overview.kpiNewToday"), value: stats.newUsersToday.toLocaleString("fr-FR") },
        { label: t("admin.overview.kpiActiveListings"), value: stats.activeListings.toLocaleString("fr-FR") },
        { label: t("admin.overview.kpiRevenue"), value: `${Number(stats.revenue ?? 0).toLocaleString("fr-FR")} FCFA` },
        { label: t("admin.overview.kpiPendingKyc"), value: stats.pendingKYC, urgent: stats.pendingKYC > 0 },
        { label: t("admin.overview.kpiOpenTickets"), value: stats.openTickets, urgent: stats.openTickets > 0 },
      ]
    : [];

  const urgentActions = [
    { label: t("admin.overview.actionPendingKyc"), to: "/admin/utilisateurs/kyc", count: stats?.pendingKYC ?? 0 },
    { label: t("admin.overview.actionModerateListings"), to: "/admin/marketplace", count: pendingProductsCount },
    { label: t("admin.overview.actionModerateArticles"), to: "/admin/contenus", count: pendingArticlesCount },
    { label: t("admin.overview.actionModerateEvents"), to: "/admin/contenus", count: pendingEventsCount },
    { label: t("admin.overview.actionModerateFormations"), to: "/admin/contenus", count: pendingFormationsCount },
    { label: t("admin.overview.actionVerifyProfiles"), to: "/admin/utilisateurs/kyc", count: pendingProfessionalsCount },
    { label: t("admin.overview.actionOpenTickets"), to: "/admin/communication/tickets", count: stats?.openTickets ?? 0 },
  ].filter((action) => action.count > 0);

  return (
    <AdminLayout title={t("admin.overview.title")} description={t("admin.overview.description")}>
      {dashboardQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.overview.loading")}</p>}
      {dashboardQuery.isError && <p className="text-[13px] text-red-300">{t("admin.overview.loadError")}</p>}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi, index) => (
              <Reveal key={kpi.label} delayMs={staggerDelay(index, 60, 240)}>
                <AdminCard className="relative overflow-hidden">
                  <span className={cn("absolute inset-x-0 top-0 h-[3px]", "urgent" in kpi && kpi.urgent ? "bg-red-400" : "bg-emerald-400")} />
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
                  <p className="mt-3 text-[28px] font-black text-white">{kpi.value}</p>
                  {"urgent" in kpi && (
                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${kpi.urgent ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {kpi.urgent ? t("admin.overview.toHandle") : t("admin.overview.ok")}
                    </span>
                  )}
                </AdminCard>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.overview.topCategories")}</h2>
              {stats.topCategories.length === 0 ? (
                <p className="text-[13px] text-slate-400">{t("admin.overview.noListingsYet")}</p>
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
              <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.overview.toHandleTitle")}</h2>
              {urgentActions.length === 0 ? (
                <p className="text-[13px] text-slate-400">{t("admin.overview.nothingToHandle")}</p>
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
