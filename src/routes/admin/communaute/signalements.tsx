import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminReportActions, useAdminReports } from "@/hooks/useAdminApi";
import type { AdminReport } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/communaute/signalements")({
  head: () => ({ meta: [{ title: "Admin signalements - IWOSAN" }] }),
  component: AdminSignalements,
});

const statusLabel: Record<AdminReport["status"], string> = {
  PENDING: "En attente",
  REVIEWED: "Examiné",
  DISMISSED: "Rejeté",
  ACTIONED: "Traité",
};

const statusColor: Record<AdminReport["status"], string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  REVIEWED: "bg-sky-500/20 text-sky-300",
  DISMISSED: "bg-white/10 text-slate-400",
  ACTIONED: "bg-emerald-500/20 text-emerald-300",
};

const reasonCategoryLabel: Record<NonNullable<AdminReport["reasonCategory"]>, string> = {
  FRAUDULENT_CONTENT: "Contenu frauduleux",
  PROHIBITED_ITEM: "Produit interdit",
  SCAM: "Arnaque",
  INAPPROPRIATE_CONTENT: "Contenu inapproprié",
  SPAM: "Spam",
  OTHER: "Autre",
};

function AdminSignalements() {
  const [status, setStatus] = useState("PENDING");
  const reportsQuery = useAdminReports({ status: status || undefined });
  const { resolve } = useAdminReportActions();
  const [actionTarget, setActionTarget] = useState<AdminReport | null>(null);
  const [notice, setNotice] = useState("");

  const reports = reportsQuery.data?.data ?? [];

  return (
    <AdminLayout title="Signalements" description="File de modération des contenus signalés par la communauté.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-4 flex gap-2">
        {["PENDING", "REVIEWED", "DISMISSED", "ACTIONED", ""].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${status === value ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
          >
            {value ? statusLabel[value as AdminReport["status"]] : "Tous"}
          </button>
        ))}
      </div>

      {reportsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {reportsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les signalements.</p>}

      {!reportsQuery.isLoading && !reportsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Type", "Contenu", "Motif", "Signalé par", "Date", "Statut", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Aucun signalement dans cette file.</td></tr>
              )}
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{report.targetType}</td>
                  <td className="px-4 py-3 text-slate-400">{report.targetId}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {report.reasonCategory && (
                      <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                        {reasonCategoryLabel[report.reasonCategory]}
                      </span>
                    )}
                    {report.reason}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{report.reporter ? `${report.reporter.firstName} ${report.reporter.lastName}` : "—"}</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(report.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusColor[report.status]}`}>{statusLabel[report.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "PENDING" || report.status === "REVIEWED" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={resolve.isPending}
                          onClick={() =>
                            resolve.mutate(
                              { id: report.id, action: "DISMISS" },
                              { onSuccess: () => setNotice("Signalement rejeté (contenu conservé).") },
                            )
                          }
                          className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200 disabled:opacity-50"
                        >
                          Ignorer
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionTarget(report)}
                          className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white"
                        >
                          Masquer le contenu
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => !open && setActionTarget(null)}
        title="Masquer ce contenu ?"
        description="Le contenu signalé sera masqué du site public."
        danger
        requireReason
        reasonLabel="Motif du masquage"
        confirmLabel="Masquer"
        pending={resolve.isPending}
        onConfirm={(reason) => {
          if (!actionTarget || !reason) return;
          resolve.mutate(
            { id: actionTarget.id, action: "ACTION", reason },
            { onSuccess: () => { setNotice("Contenu masqué."); setActionTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
