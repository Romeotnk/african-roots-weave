import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminModerationActions, usePendingArticles, usePendingEvents, usePendingFormations } from "@/hooks/useAdminApi";
import { MonographManager } from "@/components/admin/MonographManager";
import { RitesCultureManager } from "@/components/admin/RitesCultureManager";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/admin/contenus")({
  head: () => ({ meta: [{ title: "Admin contenus - IWOSAN" }] }),
  component: AdminContenus,
});

type PendingArticle = { id: string; title: string; space: string; category: string | null; createdAt: string };
type PendingEvent = { id: string; title: string; type: string; startDate: string; createdBy?: { firstName: string; lastName: string } };
type PendingFormation = { id: string; title: string; type: string; category: string; createdAt: string; createdBy?: { firstName: string; lastName: string } };

type Tab = "articles" | "events" | "formations" | "pharmacopee" | "rites" | "categories";
type ModerationTab = "articles" | "events" | "formations";
type RejectTarget = { id: string; label: string; kind: ModerationTab };

function AdminContenus() {
  const { t } = useTranslation();
  const { roles } = useAuth();
  const isSuperAdmin = roles.includes("super_admin");
  const [tab, setTab] = useState<Tab>("articles");
  const articlesQuery = usePendingArticles();
  const eventsQuery = usePendingEvents();
  const formationsQuery = usePendingFormations();
  const {
    approveArticle, rejectArticle,
    approveEvent, rejectEvent,
    approveFormation, rejectFormation,
  } = useAdminModerationActions();
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [notice, setNotice] = useState("");

  const articles = (articlesQuery.data?.data ?? []) as PendingArticle[];
  const events = (eventsQuery.data?.data ?? []) as PendingEvent[];
  const formations = (formationsQuery.data?.data ?? []) as PendingFormation[];

  const counts = { articles: articles.length, events: events.length, formations: formations.length };

  const rejectMutation = rejectTarget?.kind === "articles" ? rejectArticle : rejectTarget?.kind === "events" ? rejectEvent : rejectFormation;

  return (
    <AdminLayout title={t("admin.content.title")} description={t("admin.content.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-4 flex gap-2">
        {([
          ["articles", t("admin.content.tabArticles")],
          ["events", t("admin.content.tabEvents")],
          ["formations", t("admin.content.tabFormations")],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === value ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
          >
            {label} ({counts[value]})
          </button>
        ))}
        {([
          ...(isSuperAdmin ? ([["pharmacopee", t("admin.content.tabPharmacopoeia")], ["rites", t("admin.content.tabRitesCultures")]] as const) : []),
          ["categories", t("admin.content.tabCategories")],
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
        {!isSuperAdmin && (
          <p className="ml-2 self-center text-[11px] text-slate-400">{t("admin.content.superAdminOnlyNotice")}</p>
        )}
      </div>

      {tab === "articles" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.content.colTitle"), t("admin.content.colSpace"), t("admin.content.colCategory"), t("admin.content.colCreatedOn"), t("admin.content.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {articlesQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.loading")}</td></tr>}
              {!articlesQuery.isLoading && articles.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.noPendingArticles")}</td></tr>
              )}
              {articles.map((article) => (
                <tr key={article.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{article.title}</td>
                  <td className="px-4 py-3 text-slate-200">{article.space}</td>
                  <td className="px-4 py-3 text-slate-200">{article.category ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(article.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={approveArticle.isPending}
                        onClick={() => approveArticle.mutate(article.id, { onSuccess: () => setNotice(t("admin.content.approved", { title: article.title })) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.content.approve")}
                      </button>
                      <button type="button" onClick={() => setRejectTarget({ id: article.id, label: article.title, kind: "articles" })} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        {t("admin.content.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "events" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.content.colTitle"), t("admin.content.colType"), t("admin.content.colDate"), t("admin.content.colCreator"), t("admin.content.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {eventsQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.loading")}</td></tr>}
              {!eventsQuery.isLoading && events.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.noPendingEvents")}</td></tr>
              )}
              {events.map((event) => (
                <tr key={event.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{event.title}</td>
                  <td className="px-4 py-3 text-slate-200">{event.type}</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(event.startDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-slate-200">{event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={approveEvent.isPending}
                        onClick={() => approveEvent.mutate(event.id, { onSuccess: () => setNotice(t("admin.content.approved", { title: event.title })) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.content.approve")}
                      </button>
                      <button type="button" onClick={() => setRejectTarget({ id: event.id, label: event.title, kind: "events" })} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        {t("admin.content.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "formations" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.content.colTitle"), t("admin.content.colType"), t("admin.content.colCategory"), t("admin.content.colCreator"), t("admin.content.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {formationsQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.loading")}</td></tr>}
              {!formationsQuery.isLoading && formations.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.content.noPendingFormations")}</td></tr>
              )}
              {formations.map((formation) => (
                <tr key={formation.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{formation.title}</td>
                  <td className="px-4 py-3 text-slate-200">{formation.type}</td>
                  <td className="px-4 py-3 text-slate-200">{formation.category}</td>
                  <td className="px-4 py-3 text-slate-200">{formation.createdBy ? `${formation.createdBy.firstName} ${formation.createdBy.lastName}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={approveFormation.isPending}
                        onClick={() => approveFormation.mutate(formation.id, { onSuccess: () => setNotice(t("admin.content.approvedFem", { title: formation.title })) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.content.approve")}
                      </button>
                      <button type="button" onClick={() => setRejectTarget({ id: formation.id, label: formation.title, kind: "formations" })} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        {t("admin.content.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pharmacopee" && isSuperAdmin && <MonographManager />}
      {tab === "rites" && isSuperAdmin && <RitesCultureManager />}
      {tab === "categories" && <TaxonomyManager />}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("admin.content.rejectTitle", { label: rejectTarget?.label ?? "" })}
        danger
        requireReason
        reasonLabel={t("admin.content.rejectReasonLabel")}
        confirmLabel={t("admin.content.reject")}
        pending={rejectMutation.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget || !reason) return;
          rejectMutation.mutate(
            { id: rejectTarget.id, reason },
            { onSuccess: () => { setNotice(t("admin.content.rejected", { label: rejectTarget.label })); setRejectTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
