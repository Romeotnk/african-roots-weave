import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAdminEmailTemplates,
  useAdminTranslations,
  useUpdateAdminEmailTemplate,
  useUpdateAdminTranslations,
} from "@/hooks/useAdminApi";
import { flattenTranslations, STATIC_TRANSLATIONS, type SupportedLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/admin/site/textes")({
  head: () => ({ meta: [{ title: "Textes du site - IWOSAN" }] }),
  component: AdminTextes,
});

type Tab = "traductions" | "emails";

function AdminTextes() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("traductions");

  return (
    <AdminLayout title={t("admin.siteTexts.title")} description={t("admin.siteTexts.description")}>
      <div className="mb-4 flex gap-2">
        {([
          ["traductions", t("admin.siteTexts.tabTranslations")],
          ["emails", t("admin.siteTexts.tabEmails")],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === value ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "traductions" ? <TranslationsPanel /> : <EmailTemplatesPanel />}
    </AdminLayout>
  );
}

function TranslationsPanel() {
  const { t } = useTranslation();
  const [locale, setLocale] = useState<SupportedLanguage>("fr");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const translationsQuery = useAdminTranslations(locale);
  const updateTranslations = useUpdateAdminTranslations();

  const staticDefaults = useMemo(() => flattenTranslations(STATIC_TRANSLATIONS[locale]), [locale]);
  const overrides = useMemo(
    () => new Map((translationsQuery.data?.data ?? []).map((row) => [row.key, row.value])),
    [translationsQuery.data],
  );

  const rows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return Object.entries(staticDefaults)
      .filter(([key, defaultValue]) => !normalizedSearch || key.toLowerCase().includes(normalizedSearch) || defaultValue.toLowerCase().includes(normalizedSearch))
      .map(([key, defaultValue]) => ({
        key,
        defaultValue,
        effectiveValue: drafts[key] ?? overrides.get(key) ?? defaultValue,
        isOverridden: overrides.has(key),
      }));
  }, [staticDefaults, overrides, drafts, search]);

  const changedCount = Object.keys(drafts).length;

  const save = () => {
    updateTranslations.mutate(
      { locale, entries: drafts },
      {
        onSuccess: () => {
          setDrafts({});
          setNotice(t("admin.siteTexts.savedCount", { count: changedCount }));
        },
        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.siteTexts.saveError")),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={locale}
          onChange={(event) => { setLocale(event.target.value as SupportedLanguage); setDrafts({}); }}
          className="h-10 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
        >
          <option value="fr">{t("admin.siteTexts.french")}</option>
          <option value="en">{t("admin.siteTexts.english")}</option>
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("admin.siteTexts.searchPlaceholder")}
          className="h-10 min-w-[240px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <button
          type="button"
          disabled={changedCount === 0 || updateTranslations.isPending}
          onClick={save}
          className="h-10 rounded-full bg-emerald-400 px-5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
        >
          {updateTranslations.isPending ? t("admin.siteTexts.saving") : changedCount > 0 ? t("admin.siteTexts.saveWithCount", { count: changedCount }) : t("admin.siteTexts.save")}
        </button>
      </div>

      {notice && <p className="rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</p>}
      {translationsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.siteTexts.loading")}</p>}

      <AdminCard>
        <p className="mb-4 text-[13px] text-slate-400">
          {t("admin.siteTexts.keysCount", { count: rows.length })}{search ? t("admin.siteTexts.matchingSearch") : ""}{t("admin.siteTexts.overrideHint")}
        </p>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="rounded-lg border border-white/10 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-500">{row.key}</span>
                {row.isOverridden && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">{t("admin.siteTexts.modified")}</span>}
              </div>
              <textarea
                value={row.effectiveValue}
                onChange={(event) => setDrafts((current) => ({ ...current, [row.key]: event.target.value }))}
                rows={row.defaultValue.length > 80 ? 3 : 1}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-[13px] text-white outline-none"
              />
            </div>
          ))}
          {rows.length === 0 && !translationsQuery.isLoading && (
            <p className="py-6 text-center text-[13px] text-slate-400">{t("admin.siteTexts.noKeysMatch")}</p>
          )}
        </div>
      </AdminCard>
    </div>
  );
}

function EmailTemplatesPanel() {
  const { t } = useTranslation();
  const templatesQuery = useAdminEmailTemplates();
  const updateTemplate = useUpdateAdminEmailTemplate();
  const [drafts, setDrafts] = useState<Record<string, { subject: string; html: string }>>({});
  const [notice, setNotice] = useState("");

  const templates = templatesQuery.data?.data ?? [];
  const templateLabels: Record<string, string> = {
    verification: t("admin.siteTexts.templateVerification"),
    password_reset: t("admin.siteTexts.templatePasswordReset"),
  };

  const save = (key: string) => {
    const draft = drafts[key];
    if (!draft) return;
    updateTemplate.mutate(
      { key, subject: draft.subject, html: draft.html },
      {
        onSuccess: () => setNotice(t("admin.siteTexts.templateSaved", { label: templateLabels[key] ?? key })),
        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.siteTexts.saveError")),
      },
    );
  };

  return (
    <div className="space-y-4">
      {notice && <p className="rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</p>}
      {templatesQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.siteTexts.loading")}</p>}
      {templates.map((template) => {
        const draft = drafts[template.key] ?? { subject: template.subject, html: template.html };
        return (
          <AdminCard key={template.key}>
            <h2 className="mb-1 text-[16px] font-bold text-white">{templateLabels[template.key] ?? template.key}</h2>
            <p className="mb-4 text-[12px] text-slate-500">{t("admin.siteTexts.availableVariable")}<code className="font-mono">{"{{url}}"}</code></p>
            <label className="mb-3 block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{t("admin.siteTexts.subject")}</span>
              <input
                value={draft.subject}
                onChange={(event) => setDrafts((current) => ({ ...current, [template.key]: { ...draft, subject: event.target.value } }))}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white outline-none"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{t("admin.siteTexts.htmlContent")}</span>
              <textarea
                value={draft.html}
                onChange={(event) => setDrafts((current) => ({ ...current, [template.key]: { ...draft, html: event.target.value } }))}
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 font-mono text-[12px] text-white outline-none"
              />
            </label>
            <button
              type="button"
              disabled={updateTemplate.isPending}
              onClick={() => save(template.key)}
              className="h-10 rounded-full bg-emerald-400 px-5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
            >
              {updateTemplate.isPending ? t("admin.siteTexts.saving") : t("admin.siteTexts.save")}
            </button>
          </AdminCard>
        );
      })}
    </div>
  );
}
