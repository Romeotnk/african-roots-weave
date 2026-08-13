import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminPageActions, useAdminPages } from "@/hooks/useAdminApi";
import type { AdminPage } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/site/pages")({
  head: () => ({ meta: [{ title: "Admin pages - IWOSAN" }] }),
  component: AdminPages,
});

type PageDraft = {
  slug: string;
  title: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
};

const emptyDraft: PageDraft = {
  slug: "",
  title: "",
  contentHtml: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
};

const toDraft = (page: AdminPage): PageDraft => ({
  slug: page.slug,
  title: page.title,
  contentHtml: page.contentHtml,
  metaTitle: page.metaTitle ?? "",
  metaDescription: page.metaDescription ?? "",
  isPublished: page.isPublished,
});

function AdminPages() {
  const { t } = useTranslation();
  const pagesQuery = useAdminPages();
  const { create, update, remove } = useAdminPageActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageDraft>(emptyDraft);
  const [deleteTarget, setDeleteTarget] = useState<AdminPage | null>(null);
  const [notice, setNotice] = useState("");

  const pages = pagesQuery.data?.data ?? [];
  const isPending = create.isPending || update.isPending;

  const selectPage = (page: AdminPage | null) => {
    setSelectedId(page?.id ?? null);
    setDraft(page ? toDraft(page) : { ...emptyDraft });
  };

  const savePage = () => {
    if (!draft.slug.trim() || !draft.title.trim()) return;
    const body = { ...draft, slug: draft.slug.trim() };

    if (selectedId) {
      update.mutate(
        { id: selectedId, body },
        { onSuccess: () => setNotice(t("admin.cmsPages.updated")) },
      );
    } else {
      create.mutate(body, {
        onSuccess: (created) => {
          setNotice(t("admin.cmsPages.created"));
          if (created.data?.id) setSelectedId(created.data.id);
        },
      });
    }
  };

  return (
    <AdminLayout title={t("admin.cmsPages.title")} description={t("admin.cmsPages.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <AdminCard>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-white">{t("admin.cmsPages.pagesCount", { count: pages.length })}</h2>
            <button
              type="button"
              onClick={() => selectPage(null)}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-[12px] font-bold text-[#111827]"
            >
              <Plus size={14} /> {t("admin.cmsPages.newPage")}
            </button>
          </div>
          <div className="space-y-1.5">
            {pagesQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.cmsPages.loading")}</p>}
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => selectPage(page)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] ${selectedId === page.id ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="font-semibold">{page.title || page.slug}</span>
                <span className="ml-2 text-[11px] text-slate-500">/{page.slug}</span>
                {!page.isPublished && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{t("admin.cmsPages.draft")}</span>}
              </button>
            ))}
            {!pagesQuery.isLoading && pages.length === 0 && <p className="text-[13px] text-slate-400">{t("admin.cmsPages.noPagesYet")}</p>}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{selectedId ? t("admin.cmsPages.editPage") : t("admin.cmsPages.newPageTitle")}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-[13px] text-slate-300">
                {t("admin.cmsPages.slugLabel")}
                <input
                  value={draft.slug}
                  onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                  placeholder={t("admin.cmsPages.slugPlaceholder")}
                  className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
                />
              </label>
              <label className="block text-[13px] text-slate-300">
                {t("admin.cmsPages.titleLabel")}
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-[13px] text-slate-300">
                {t("admin.cmsPages.metaTitleLabel")}
                <input
                  value={draft.metaTitle}
                  onChange={(event) => setDraft((current) => ({ ...current, metaTitle: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
                />
              </label>
              <label className="block text-[13px] text-slate-300">
                {t("admin.cmsPages.metaDescriptionLabel")}
                <input
                  value={draft.metaDescription}
                  onChange={(event) => setDraft((current) => ({ ...current, metaDescription: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
                />
              </label>
            </div>
            <label className="block text-[13px] text-slate-300">
              {t("admin.cmsPages.contentHtmlLabel")}
              <textarea
                value={draft.contentHtml}
                onChange={(event) => setDraft((current) => ({ ...current, contentHtml: event.target.value }))}
                className="mt-1 min-h-48 w-full rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-[13px] text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-slate-300">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(event) => setDraft((current) => ({ ...current, isPublished: event.target.checked }))}
                className="h-4 w-4"
              />
              {t("admin.cmsPages.publishedLabel")}
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={isPending || !draft.slug.trim() || !draft.title.trim()}
              onClick={savePage}
              className="rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
            >
              {isPending ? t("admin.cmsPages.saving") : t("admin.cmsPages.save")}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={() => setDeleteTarget(pages.find((page) => page.id === selectedId) ?? null)}
                className="rounded-full bg-red-500/80 px-5 py-2 text-[13px] font-bold text-white"
              >
                {t("admin.cmsPages.delete")}
              </button>
            )}
          </div>
        </AdminCard>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("admin.cmsPages.deleteTitle", { title: deleteTarget?.title ?? "" })}
        description={t("admin.cmsPages.deleteDesc")}
        danger
        confirmLabel={t("admin.cmsPages.delete")}
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              setNotice(t("admin.cmsPages.deleted"));
              selectPage(null);
              setDeleteTarget(null);
            },
          });
        }}
      />
    </AdminLayout>
  );
}
