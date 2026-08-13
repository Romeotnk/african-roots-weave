import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminConfig, useUpdateAdminConfig } from "@/hooks/useAdminApi";
import { DEFAULT_HOMEPAGE_SECTIONS, buildHomepageSectionLabels, parseHomepageSections, type HomepageSectionConfig } from "@/lib/homepageSections";

export const Route = createFileRoute("/admin/site/accueil")({
  head: () => ({ meta: [{ title: "Admin accueil - IWOSAN" }] }),
  component: AdminAccueil,
});

const defaults = {
  "site.home.metaTitle": "IWOSAN - Plateforme panafricaine",
  "site.home.metaDescription": "Le savoir endogène africain, documenté, transmis, vivant.",
  "site.home.announcement": "",
};

function AdminAccueil() {
  const { t } = useTranslation();
  const sectionLabels = buildHomepageSectionLabels(t);
  const configQuery = useAdminConfig();
  const updateConfig = useUpdateAdminConfig();
  const [form, setForm] = useState(defaults);
  const [sections, setSections] = useState<HomepageSectionConfig[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!configQuery.data?.data) return;
    const byKey = Object.fromEntries(configQuery.data.data.map((row) => [row.key, row.value]));
    setForm((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(defaults).map((key) => [key, byKey[key] ?? current[key as keyof typeof defaults]])),
    }));
    setSections(parseHomepageSections(byKey["homepage.sections"]));
  }, [configQuery.data]);

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleSection = (index: number) => {
    setSections((current) => current.map((section, i) => (i === index ? { ...section, enabled: !section.enabled } : section)));
  };

  return (
    <AdminLayout title={t("admin.homepageAdmin.title")} description={t("admin.homepageAdmin.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.homepageAdmin.seo")}</h2>
          <div className="space-y-4">
            <label className="block text-[13px] text-slate-300">
              {t("admin.homepageAdmin.pageTitle")}
              <input
                value={form["site.home.metaTitle"]}
                onChange={(event) => setForm((current) => ({ ...current, "site.home.metaTitle": event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
              />
            </label>
            <label className="block text-[13px] text-slate-300">
              {t("admin.homepageAdmin.metaDescription")}
              <textarea
                value={form["site.home.metaDescription"]}
                onChange={(event) => setForm((current) => ({ ...current, "site.home.metaDescription": event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
              />
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.homepageAdmin.announcementBanner")}</h2>
          <p className="mb-3 text-[13px] text-slate-400">
            {t("admin.homepageAdmin.announcementDesc")}
          </p>
          <textarea
            value={form["site.home.announcement"]}
            onChange={(event) => setForm((current) => ({ ...current, "site.home.announcement": event.target.value }))}
            placeholder={t("admin.homepageAdmin.announcementPlaceholder")}
            className="min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
          />
          <p className="mt-4 text-[13px] text-slate-400">
            {t("admin.homepageAdmin.carouselManagedFrom")}{" "}
            <Link to="/admin/site/publicites" className="font-semibold text-emerald-300">
              {t("admin.homepageAdmin.adsCarouselLink")}
            </Link>.
          </p>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <h2 className="mb-1 text-[18px] font-bold text-white">{t("admin.homepageAdmin.homepageSections")}</h2>
        <p className="mb-4 text-[13px] text-slate-400">
          {t("admin.homepageAdmin.sectionsDesc")}
        </p>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.key}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${section.enabled ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02] opacity-60"}`}
            >
              <label className="flex flex-1 items-center gap-3 text-[13px] text-slate-200">
                <input type="checkbox" checked={section.enabled} onChange={() => toggleSection(index)} className="h-4 w-4 accent-emerald-400" />
                {sectionLabels[section.key]}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                  aria-label={t("admin.homepageAdmin.moveUp")}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                  aria-label={t("admin.homepageAdmin.moveDown")}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <button
        type="button"
        disabled={updateConfig.isPending}
        onClick={() =>
          updateConfig.mutate(
            { ...form, "homepage.sections": JSON.stringify(sections) },
            { onSuccess: () => setNotice(t("admin.homepageAdmin.updated")) },
          )
        }
        className="mt-6 rounded-full bg-emerald-400 px-5 py-2.5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
      >
        {updateConfig.isPending ? t("admin.homepageAdmin.saving") : t("admin.homepageAdmin.save")}
      </button>
    </AdminLayout>
  );
}
