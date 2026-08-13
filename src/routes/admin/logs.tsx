import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuditLog } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({ meta: [{ title: "Admin logs - IWOSAN" }] }),
  component: AdminLogsPage,
});

type AuditLogEntry = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  ipAddress: string | null;
  user: { email: string; role: string } | null;
};

function AdminLogsPage() {
  const { t } = useTranslation();
  const auditQuery = useAdminAuditLog();
  const logs = (auditQuery.data?.data ?? []) as AuditLogEntry[];

  return (
    <AdminLayout title={t("admin.auditLogs.title")} description={t("admin.auditLogs.description")}>
      {auditQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.auditLogs.loading")}</p>}
      {auditQuery.isError && (
        <p className="text-[13px] text-red-300">
          {t("admin.auditLogs.loadError")}
        </p>
      )}

      {!auditQuery.isLoading && !auditQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.auditLogs.colDate"), t("admin.auditLogs.colAdmin"), t("admin.auditLogs.colRole"), t("admin.auditLogs.colAction"), t("admin.auditLogs.colTarget"), t("admin.auditLogs.colIp")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.auditLogs.noLogs")}</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-slate-200">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 text-slate-200">{log.user?.email ?? t("admin.auditLogs.system")}</td>
                  <td className="px-4 py-3 text-slate-200">{log.user?.role ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-white">{log.action}</td>
                  <td className="px-4 py-3 text-slate-200">{log.targetType ? `${log.targetType} · ${log.targetId?.slice(0, 8)}...` : "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{log.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
