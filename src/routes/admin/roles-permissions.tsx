import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminPermissions, useUpdateRolePermissions } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/roles-permissions")({
  head: () => ({ meta: [{ title: "Rôles & permissions - IWOSAN" }] }),
  component: AdminRolesPermissions,
});

const ROLES = ["SUPER_ADMIN", "ADMIN", "PROFESSIONAL", "USER"] as const;
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  PROFESSIONAL: "Professionnel",
  USER: "Utilisateur",
};

function AdminRolesPermissions() {
  const permissionsQuery = useAdminPermissions();
  const updateRolePermissions = useUpdateRolePermissions();
  const [draft, setDraft] = useState<Partial<Record<string, Set<string>>>>({});
  const [notice, setNotice] = useState("");

  const catalog = permissionsQuery.data?.data?.catalog ?? [];
  const groups = [...new Set(catalog.map((entry) => entry.group))];

  useEffect(() => {
    const rolePermissions = permissionsQuery.data?.data?.rolePermissions;
    if (!rolePermissions) return;
    setDraft(Object.fromEntries(ROLES.map((role) => [role, new Set(rolePermissions[role] ?? [])])));
  }, [permissionsQuery.data]);

  const toggle = (role: string, permission: string) => {
    setDraft((current) => {
      const next = new Set(current[role] ?? []);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return { ...current, [role]: next };
    });
  };

  const saveRole = (role: string) => {
    updateRolePermissions.mutate(
      { role, permissions: [...(draft[role] ?? [])] },
      {
        onSuccess: () => setNotice(`Permissions de « ${roleLabels[role]} » mises à jour.`),
        onError: (error) =>
          setNotice(error instanceof Error ? error.message : `Impossible de mettre à jour « ${roleLabels[role]} ».`),
      },
    );
  };

  return (
    <AdminLayout
      title="Rôles & permissions"
      description="Composez les permissions par défaut de chaque rôle. SUPER_ADMIN a toujours accès à tout, quel que soit ce tableau."
    >
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}
      {permissionsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {permissionsQuery.isError && (
        <p className="text-[13px] text-red-300">
          Cette page est réservée au rôle Super Admin. Vous n'avez pas les droits pour consulter ou modifier les permissions.
        </p>
      )}

      {!permissionsQuery.isLoading && !permissionsQuery.isError && (
        <div className="space-y-6">
          {ROLES.filter((role) => role !== "SUPER_ADMIN").map((role) => (
            <AdminCard key={role}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-white">{roleLabels[role]}</h2>
                <button
                  type="button"
                  disabled={updateRolePermissions.isPending}
                  onClick={() => saveRole(role)}
                  className="rounded-full bg-emerald-400 px-4 py-1.5 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                >
                  {updateRolePermissions.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                  <div key={group}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{group}</p>
                    <div className="space-y-1.5">
                      {catalog
                        .filter((entry) => entry.group === group)
                        .map((entry) => (
                          <label key={entry.key} className="flex items-center gap-2 text-[13px] text-slate-300">
                            <input
                              type="checkbox"
                              checked={draft[role]?.has(entry.key) ?? false}
                              onChange={() => toggle(role, entry.key)}
                              className="h-4 w-4 accent-emerald-400"
                            />
                            {entry.label}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
