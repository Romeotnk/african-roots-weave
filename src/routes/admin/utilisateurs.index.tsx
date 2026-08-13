import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminUserActions, useAdminUsers } from "@/hooks/useAdminApi";
import type { AdminUser } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/utilisateurs/")({
  head: () => ({ meta: [{ title: "Admin utilisateurs - IWOSAN" }] }),
  component: AdminUsersPage,
});

const roleOptions = ["", "USER", "PROFESSIONAL", "ADMIN", "SUPER_ADMIN"];

function AdminUsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [banned, setBanned] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const usersQuery = useAdminUsers({ page, limit: 20, search: search || undefined, role: role || undefined, banned: banned === "" ? undefined : banned === "true" });
  const { ban, unban } = useAdminUserActions();

  const users = usersQuery.data?.data ?? [];
  const pagination = usersQuery.data?.pagination;

  return (
    <AdminLayout title={t("admin.usersList.title")} description={t("admin.usersList.description")}>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder={t("admin.usersList.searchPlaceholder")}
          className="h-11 min-w-[220px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
          {roleOptions.map((option) => <option key={option} value={option}>{option || t("admin.usersList.allRoles")}</option>)}
        </select>
        <select value={banned} onChange={(event) => { setBanned(event.target.value as typeof banned); setPage(1); }} className="h-11 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
          <option value="">{t("admin.usersList.allStatuses")}</option>
          <option value="false">{t("admin.usersList.active")}</option>
          <option value="true">{t("admin.usersList.banned")}</option>
        </select>
      </div>

      {usersQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.usersList.loading")}</p>}
      {usersQuery.isError && <p className="text-[13px] text-red-300">{t("admin.usersList.loadError")}</p>}

      {!usersQuery.isLoading && !usersQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>
                {[t("admin.usersList.colName"), t("admin.usersList.colEmail"), t("admin.usersList.colRole"), t("admin.usersList.colCountry"), t("admin.usersList.colStatus"), t("admin.usersList.colActions")].map((header) => (
                  <th key={header} className="px-4 py-3 font-bold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.usersList.noUsersMatch")}</td></tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-slate-200">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{user.email}</td>
                  <td className="px-4 py-3 text-slate-200">{user.role}</td>
                  <td className="px-4 py-3 text-slate-200">{user.country}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${user.isBanned ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {user.isBanned ? t("admin.usersList.bannedStatus") : t("admin.usersList.activeStatus")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to="/admin/utilisateurs/$id" params={{ id: user.id }} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">{t("admin.usersList.view")}</Link>
                      {user.isBanned ? (
                        <button
                          type="button"
                          onClick={() => unban.mutate(user.id)}
                          disabled={unban.isPending}
                          className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                        >
                          {t("admin.usersList.unban")}
                        </button>
                      ) : (
                        <button type="button" onClick={() => setBanTarget(user)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                          {t("admin.usersList.ban")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[13px] text-slate-400">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-40">{t("admin.usersList.previous")}</button>
          <span>{t("admin.usersList.pageOf", { page: pagination.page, totalPages: pagination.totalPages })}</span>
          <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-40">{t("admin.usersList.next")}</button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(banTarget)}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={t("admin.usersList.banTitle", { name: `${banTarget?.firstName ?? ""} ${banTarget?.lastName ?? ""}` })}
        description={t("admin.usersList.banDesc")}
        danger
        requireReason
        reasonLabel={t("admin.usersList.banReasonLabel")}
        confirmLabel={t("admin.usersList.ban")}
        pending={ban.isPending}
        onConfirm={(reason) => {
          if (!banTarget || !reason) return;
          ban.mutate({ id: banTarget.id, reason }, { onSuccess: () => setBanTarget(null) });
        }}
      />
    </AdminLayout>
  );
}
