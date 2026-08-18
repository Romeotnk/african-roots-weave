import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminCustomRoleActions, useAdminCustomRoles, useAdminPermissions, useUpdateRolePermissions } from "@/hooks/useAdminApi";
import type { CustomRole } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/roles-permissions")({
  head: () => ({ meta: [{ title: "Rôles & permissions - IWOSAN" }] }),
  component: AdminRolesPermissions,
});

const ROLES = ["SUPER_ADMIN", "ADMIN", "PROFESSIONAL", "USER"] as const;

function AdminRolesPermissions() {
  const { t } = useTranslation();
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: t("admin.rolesPermissions.roleSuperAdmin"),
    ADMIN: t("admin.rolesPermissions.roleAdmin"),
    PROFESSIONAL: t("admin.rolesPermissions.roleProfessional"),
    USER: t("admin.rolesPermissions.roleUser"),
  };
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
        onSuccess: () => setNotice(t("admin.rolesPermissions.permissionsUpdated", { role: roleLabels[role] })),
        onError: (error) =>
          setNotice(error instanceof Error ? error.message : t("admin.rolesPermissions.permissionsUpdateError", { role: roleLabels[role] })),
      },
    );
  };

  return (
    <AdminLayout
      title={t("admin.rolesPermissions.title")}
      description={t("admin.rolesPermissions.description")}
    >
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}
      {permissionsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.rolesPermissions.loading")}</p>}
      {permissionsQuery.isError && (
        <p className="text-[13px] text-red-300">
          {t("admin.rolesPermissions.accessDenied")}
        </p>
      )}

      {!permissionsQuery.isLoading && !permissionsQuery.isError && (
        <div className="space-y-6">
          <CustomRolesSection catalog={catalog} groups={groups} />
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
                  {updateRolePermissions.isPending ? t("admin.rolesPermissions.saving") : t("admin.rolesPermissions.save")}
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

function CustomRolesSection({ catalog, groups }: { catalog: { key: string; label: string; group: string }[]; groups: string[] }) {
  const { t } = useTranslation();
  const customRolesQuery = useAdminCustomRoles();
  const { create, update, remove } = useAdminCustomRoleActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<CustomRole | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const roles = customRolesQuery.data?.data ?? [];

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setName("");
    setPermissions(new Set());
    setError("");
  };

  const startEdit = (role: CustomRole) => {
    setCreating(true);
    setEditingId(role.id);
    setName(role.name);
    setPermissions(new Set(role.permissions));
    setError("");
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setError("");
  };

  const togglePermission = (key: string) => {
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const save = () => {
    setError("");
    if (name.trim().length < 3) {
      setError(t("admin.rolesPermissions.customRoleNameTooShort"));
      return;
    }

    const payload = { name: name.trim(), permissions: [...permissions] };
    if (editingId) {
      update.mutate(
        { id: editingId, ...payload },
        {
          onSuccess: () => { setNotice(t("admin.rolesPermissions.customRoleUpdated", { name: payload.name })); cancel(); },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("admin.rolesPermissions.customRoleSaveError")),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { setNotice(t("admin.rolesPermissions.customRoleCreated", { name: payload.name })); cancel(); },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("admin.rolesPermissions.customRoleSaveError")),
      });
    }
  };

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-white">{t("admin.rolesPermissions.customRolesTitle")}</h2>
          <p className="mt-1 text-[12px] text-slate-500">{t("admin.rolesPermissions.customRolesDescription")}</p>
        </div>
        {!creating && (
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-4 py-1.5 text-[12px] font-bold text-[#111827]">
            <Plus size={14} /> {t("admin.rolesPermissions.newCustomRole")}
          </button>
        )}
      </div>

      {notice && <p className="mb-3 text-[12px] font-semibold text-emerald-300">{notice}</p>}

      {creating && (
        <div className="mb-5 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("admin.rolesPermissions.customRoleNamePlaceholder")}
            className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white outline-none"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{group}</p>
                <div className="space-y-1.5">
                  {catalog.filter((entry) => entry.group === group).map((entry) => (
                    <label key={entry.key} className="flex items-center gap-2 text-[13px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.has(entry.key)}
                        onChange={() => togglePermission(entry.key)}
                        className="h-4 w-4 accent-emerald-400"
                      />
                      {entry.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-[13px] font-semibold text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={create.isPending || update.isPending}
              onClick={save}
              className="rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
            >
              {create.isPending || update.isPending ? t("admin.rolesPermissions.saving") : t("admin.rolesPermissions.save")}
            </button>
            <button type="button" onClick={cancel} className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80">
              {t("admin.rolesPermissions.cancel")}
            </button>
          </div>
        </div>
      )}

      {customRolesQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.rolesPermissions.loading")}</p>}
      {!customRolesQuery.isLoading && roles.length === 0 && (
        <p className="text-[13px] text-slate-400">{t("admin.rolesPermissions.noCustomRoles")}</p>
      )}
      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5">
            <div>
              <p className="text-[13px] font-bold text-white">{role.name}</p>
              <p className="text-[12px] text-slate-500">{t("admin.rolesPermissions.customRolePermissionCount", { count: role.permissions.length })}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(role)} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                <Pencil size={12} /> {t("admin.rolesPermissions.edit")}
              </button>
              <button type="button" onClick={() => setDeleteTarget(role)} className="inline-flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                <Trash2 size={12} /> {t("admin.rolesPermissions.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("admin.rolesPermissions.deleteCustomRoleTitle", { name: deleteTarget?.name ?? "" })}
        description={t("admin.rolesPermissions.deleteCustomRoleDescription")}
        danger
        confirmLabel={t("admin.rolesPermissions.delete")}
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, {
            onSuccess: () => { setNotice(t("admin.rolesPermissions.customRoleDeleted", { name: deleteTarget.name })); setDeleteTarget(null); },
          });
        }}
      />
    </AdminCard>
  );
}
