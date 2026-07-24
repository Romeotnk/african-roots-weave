import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminCommissionConfig, useUpdateAdminCommissionConfig } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/finances/commissions")({
  head: () => ({ meta: [{ title: "Admin commissions - IWOSAN" }] }),
  component: AdminCommissionsPage,
});

const fields: { key: "global" | "level1" | "level2" | "level3"; label: string; fallback: string }[] = [
  { key: "global", label: "Taux global vendeur (%)", fallback: "10" },
  { key: "level1", label: "Affiliation niveau 1 (%)", fallback: "3" },
  { key: "level2", label: "Affiliation niveau 2 (%)", fallback: "2" },
  { key: "level3", label: "Affiliation niveau 3 (%)", fallback: "1" },
];

function AdminCommissionsPage() {
  const configQuery = useAdminCommissionConfig();
  const updateConfig = useUpdateAdminCommissionConfig();
  const [values, setValues] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const rows = configQuery.data?.data ?? [];
    if (rows.length === 0) return;
    const next: Record<string, string> = {};
    rows.forEach((row) => {
      const key = row.key.replace("commission.", "");
      next[key] = row.value;
    });
    setValues(next);
  }, [configQuery.data]);

  const save = () => {
    updateConfig.mutate(values, {
      onSuccess: () => setNotice("Taux de commission mis à jour."),
      onError: (error) => setNotice(error instanceof Error ? error.message : "Échec de l'enregistrement."),
    });
  };

  return (
    <AdminLayout title="Commissions" description="Taux prélevé par la plateforme et taux d'affiliation MLM (niveaux 1 à 3).">
      <AdminCard>
        <p className="mb-4 text-[13px] text-slate-400">
          Ces taux s'appliquent à toute nouvelle commande — les commandes déjà créées ne sont pas recalculées.
        </p>
        <div className="grid gap-4 md:grid-cols-4">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{field.label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={values[field.key] ?? field.fallback}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
              />
            </label>
          ))}
        </div>
        {notice && <p className="mt-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</p>}
        <button
          type="button"
          disabled={updateConfig.isPending}
          onClick={save}
          className="mt-4 rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
        >
          {updateConfig.isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </AdminCard>
    </AdminLayout>
  );
}
