import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminCommissionConfig, useUpdateAdminCommissionConfig } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/finances/commissions")({
  head: () => ({ meta: [{ title: "Admin commissions - IWOSAN" }] }),
  component: AdminCommissionsPage,
});

const fields: { key: "global" | "level1" | "level2" | "level3" | "affiliate"; label: string; fallback: string }[] = [
  { key: "global", label: "Taux global vendeur (%)", fallback: "10" },
  { key: "affiliate", label: "Programme d'affiliation (%)", fallback: "5" },
  { key: "level1", label: "Reseau MLM niveau 1 (%)", fallback: "3" },
  { key: "level2", label: "Reseau MLM niveau 2 (%)", fallback: "2" },
  { key: "level3", label: "Reseau MLM niveau 3 (%)", fallback: "1" },
];

// Same order as the MedCategory enum in server/prisma/schema.prisma.
const categories: { enumValue: string; label: string }[] = [
  { enumValue: "GYNECO_OBSTETRIQUE", label: "Gynéco-obstétriques" },
  { enumValue: "GASTRO_INTESTINAL", label: "Gastro-intestinales" },
  { enumValue: "MALADIES_ENFANCE", label: "Maladies de l'enfance" },
  { enumValue: "ETATS_FEBRILES_ICTERES", label: "États fébriles/Ictères" },
  { enumValue: "AFFECTIONS_CUTANEES", label: "Affections cutanées" },
  { enumValue: "SYSTEME_NERVEUX", label: "Système nerveux" },
  { enumValue: "OSTEO_ARTICULAIRE", label: "Ostéo-articulaire" },
  { enumValue: "PULMONAIRE", label: "Pulmonaire" },
  { enumValue: "URO_GENITAL", label: "Uro-génital" },
  { enumValue: "ORL", label: "ORL" },
  { enumValue: "OPHTALMOLOGIQUE", label: "Ophtalmologique" },
  { enumValue: "BUCCO_DENTAIRE", label: "Bucco-dentaire" },
  { enumValue: "CARDIO_VASCULAIRE", label: "Cardio-vasculaire" },
  { enumValue: "STOMATOLOGIQUE", label: "Stomatologique" },
  { enumValue: "MYSTIQUE", label: "Mystique" },
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
        <div className="mt-8">
          <h2 className="mb-1 text-[15px] font-bold text-white">Taux par catégorie (optionnel)</h2>
          <p className="mb-4 text-[13px] text-slate-400">
            Prioritaires sur le taux par défaut du professionnel et le taux global, mais toujours écrasés par un taux fixé au niveau d'un produit précis. Laissez vide pour ne pas surcharger.
          </p>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const key = `category.${category.enumValue}`;
              return (
                <label key={category.enumValue} className="block">
                  <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{category.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Défaut"
                    value={values[key] ?? ""}
                    onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                  />
                </label>
              );
            })}
          </div>
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
