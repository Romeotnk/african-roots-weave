import { Link } from "@tanstack/react-router";
import { AdminCard, AdminLayout, AdminTable } from "@/components/admin/AdminLayout";
import { adminActivity, adminCharts, adminKpis, adminModules, adminUrgentActions } from "@/data/admin";

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-44 items-end gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t bg-emerald-400" style={{ height: `${(value / max) * 100}%` }} />
          <span className="text-[10px] text-slate-500">{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  return (
    <AdminLayout title="Vue d'ensemble" description="Pilotage mock de la plateforme avant liaison API globale.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminKpis.map((kpi) => (
          <AdminCard key={kpi.label}>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
            <p className="mt-3 text-[28px] font-black text-white">{kpi.value}</p>
            <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${kpi.change === "urgent" ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {kpi.change}
            </span>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminCard>
          <h2 className="text-[18px] font-bold text-white">Inscriptions - 30 derniers jours</h2>
          <div className="mt-4"><MiniBarChart values={adminCharts.signups} /></div>
        </AdminCard>
        <AdminCard>
          <h2 className="text-[18px] font-bold text-white">Repartition des roles</h2>
          <div className="mt-5 space-y-3">
            {adminCharts.roles.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-[12px]"><span>{row.label}</span><span>{row.value}%</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${row.value}%` }} /></div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Ventes par categorie</h2>
          <div className="space-y-3">
            {adminCharts.salesByCategory.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-28 text-[13px] text-slate-300">{row.label}</span>
                <div className="h-3 flex-1 rounded-full bg-white/10"><div className="h-3 rounded-full bg-amber-300" style={{ width: `${row.value * 2}%` }} /></div>
                <span className="w-10 text-right text-[12px]">{row.value}</span>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">A traiter</h2>
          <div className="space-y-3">
            {adminUrgentActions.map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-[13px] font-semibold hover:bg-white/10">
                <span>{item.label}</span>
                <span className="rounded-full bg-red-500 px-2 py-1 text-[11px]">{item.count}</span>
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Top annonces du mois</h2>
          <AdminTable
            headers={["Annonce", "Vendeur", "Vues", "Commandes"]}
            rows={adminModules.marketplace.products.slice(0, 5).map((product, index) => [
              product.title,
              product.sellerName,
              4200 - index * 410,
              38 - index * 5,
            ])}
          />
        </AdminCard>
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Activite recente</h2>
          <div className="space-y-3">
            {adminActivity.map((item) => (
              <p key={item} className="rounded-lg bg-white/5 p-3 text-[13px] text-slate-300">{item}</p>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
