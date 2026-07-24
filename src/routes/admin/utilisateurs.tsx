import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminUserActions, useAdminUsers } from "@/hooks/useAdminApi";
import type { AdminUser } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/utilisateurs")({
  head: () => ({ meta: [{ title: "Admin utilisateurs - IWOSAN" }] }),
  component: AdminUsersPage,
});

const roleOptions = ["", "USER", "PROFESSIONAL", "RESEARCHER", "MODERATOR", "EDITOR", "ADMIN", "SUPER_ADMIN"];

function AdminUsersPage() {
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
    <AdminLayout title="Utilisateurs" description="Recherche, rôles, suspension et fiches utilisateurs.">
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Rechercher un email ou un prénom"
          className="h-11 min-w-[220px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
          {roleOptions.map((option) => <option key={option} value={option}>{option || "Tous les rôles"}</option>)}
        </select>
        <select value={banned} onChange={(event) => { setBanned(event.target.value as typeof banned); setPage(1); }} className="h-11 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
          <option value="">Tous les statuts</option>
          <option value="false">Actifs</option>
          <option value="true">Bannis</option>
        </select>
      </div>

      {usersQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {usersQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les utilisateurs.</p>}

      {!usersQuery.isLoading && !usersQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>
                {["Nom", "Email", "Rôle", "Pays", "Statut", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 font-bold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucun utilisateur ne correspond à ces filtres.</td></tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-slate-200">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{user.email}</td>
                  <td className="px-4 py-3 text-slate-200">{user.role}</td>
                  <td className="px-4 py-3 text-slate-200">{user.country}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${user.isBanned ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {user.isBanned ? "Banni" : "Actif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to="/admin/utilisateurs/$id" params={{ id: user.id }} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">Voir</Link>
                      {user.isBanned ? (
                        <button
                          type="button"
                          onClick={() => unban.mutate(user.id)}
                          disabled={unban.isPending}
                          className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                        >
                          Débannir
                        </button>
                      ) : (
                        <button type="button" onClick={() => setBanTarget(user)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                          Bannir
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
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-40">Précédent</button>
          <span>Page {pagination.page} / {pagination.totalPages}</span>
          <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-40">Suivant</button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(banTarget)}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={`Bannir ${banTarget?.firstName ?? ""} ${banTarget?.lastName ?? ""}`}
        description="Le compte sera immédiatement bloqué. Indiquez un motif conservé dans l'historique de modération."
        danger
        requireReason
        reasonLabel="Motif du bannissement"
        confirmLabel="Bannir"
        pending={ban.isPending}
        onConfirm={(reason) => {
          if (!banTarget || !reason) return;
          ban.mutate({ id: banTarget.id, reason }, { onSuccess: () => setBanTarget(null) });
        }}
      />
    </AdminLayout>
  );
}
