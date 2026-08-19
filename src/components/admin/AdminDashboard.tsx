import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminDashboard, usePendingArticles, usePendingEvents, usePendingFormations, usePendingProducts, usePendingProfessionals } from "@/hooks/useAdminApi";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { StatCard } from "@/components/shared/StatCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const categoryChartConfig: ChartConfig = {
  count: { label: "Annonces", color: "#f0dfa0" },
};

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
                <StatCard
                  theme="dark"
                  label={kpi.label}
                  value={kpi.value}
                  tone={"urgent" in kpi ? (kpi.urgent ? "error" : "success") : "primary"}
                  badgeLabel={"urgent" in kpi ? (kpi.urgent ? t("admin.overview.toHandle") : t("admin.overview.ok")) : undefined}
                />
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.overview.topCategories")}</h2>
              {stats.topCategories.length === 0 ? (
                <p className="text-[13px] text-slate-400">{t("admin.overview.noListingsYet")}</p>
              ) : (
                <ChartContainer config={categoryChartConfig} className="aspect-auto h-[220px] w-full">
                  <BarChart
                    data={stats.topCategories.map((row) => ({ category: row.category.replaceAll("_", " "), count: row._count.id }))}
                    layout="vertical"
                    margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    />
                    <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={14}>
                      <LabelList dataKey="count" position="right" className="fill-slate-200" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
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
