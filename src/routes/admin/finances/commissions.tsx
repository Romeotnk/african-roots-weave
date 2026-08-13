import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminCommissionConfig, useUpdateAdminCommissionConfig } from "@/hooks/useAdminApi";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";

export const Route = createFileRoute("/admin/finances/commissions")({
  head: () => ({ meta: [{ title: "Admin commissions - IWOSAN" }] }),
  component: AdminCommissionsPage,
});

function AdminCommissionsPage() {
  const { t } = useTranslation();
  const fields: { key: "global" | "level1" | "level2" | "level3" | "affiliate"; label: string; fallback: string }[] = [
    { key: "global", label: t("admin.commissions.globalRate"), fallback: "10" },
    { key: "affiliate", label: t("admin.commissions.affiliateRate"), fallback: "5" },
    { key: "level1", label: t("admin.commissions.level1Rate"), fallback: "3" },
    { key: "level2", label: t("admin.commissions.level2Rate"), fallback: "2" },
    { key: "level3", label: t("admin.commissions.level3Rate"), fallback: "1" },
  ];
  const configQuery = useAdminCommissionConfig();
  const updateConfig = useUpdateAdminCommissionConfig();
  const taxonomyQuery = useTaxonomy("PRODUCT_CATEGORY");
  // Only subcategories carry commission-relevant granularity — the 4 parent
  // groups are just organizational and aren't assigned to products directly.
  const categories = useMemo(
    () => (taxonomyQuery.data ?? []).filter((item) => item.parentId).map((item) => ({ enumValue: item.slug, label: item.name })),
    [taxonomyQuery.data],
  );
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
      onSuccess: () => setNotice(t("admin.commissions.updated")),
      onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.commissions.saveError")),
    });
  };

  return (
    <AdminLayout title={t("admin.commissions.title")} description={t("admin.commissions.description")}>
      <AdminCard>
        <p className="mb-4 text-[13px] text-slate-400">
          {t("admin.commissions.appliesToNewOrders")}
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
          <h2 className="mb-1 text-[15px] font-bold text-white">{t("admin.commissions.categoryRates")}</h2>
          <p className="mb-4 text-[13px] text-slate-400">
            {t("admin.commissions.categoryRatesDesc")}
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
                    placeholder={t("admin.commissions.defaultPlaceholder")}
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
          {updateConfig.isPending ? t("admin.commissions.saving") : t("admin.commissions.save")}
        </button>
      </AdminCard>
    </AdminLayout>
  );
}
