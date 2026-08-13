import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminKycActions,
  useAdminKycDocuments,
  useAdminPermissions,
  useAdminUser,
  useAdminUserActions,
  useUpdateUserPermissionOverrides,
} from "@/hooks/useAdminApi";
import { useAuth } from "@/lib/auth/AuthContext";
import type { AdminUser } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/utilisateurs/$id")({
  head: () => ({ meta: [{ title: "Fiche utilisateur admin - IWOSAN" }] }),
  component: AdminUserDetail,
});

const allRoles = ["USER", "PROFESSIONAL", "ADMIN", "SUPER_ADMIN"];
// Mirrors adminAssignableRoles in server/src/controllers/admin.controller.ts:
// a non-SUPER_ADMIN admin may only move an account between USER and
// PROFESSIONAL — promoting to ADMIN/SUPER_ADMIN 403s. Filtering the options
// here avoids offering choices that silently fail.
const adminAssignableRoles = ["USER", "PROFESSIONAL"];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}

function AdminUserDetail() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { roles: actorRoles } = useAuth();
  const assignableRoles = actorRoles.includes("super_admin") ? allRoles : adminAssignableRoles;
  const userQuery = useAdminUser(id);
  const { ban, unban, updateRole, updateCommissionRate, setPortraitOfWeek } = useAdminUserActions();
  const [commissionRateDraft, setCommissionRateDraft] = useState("");
  const [portraitStart, setPortraitStart] = useState("");
  const [portraitEnd, setPortraitEnd] = useState("");
  const { approve: approveKyc, reject: rejectKyc } = useAdminKycActions();
  const kycDocsQuery = useAdminKycDocuments(id, userQuery.data?.data?.kycStatus !== "PENDING" && Boolean(userQuery.data?.data));
  const [banOpen, setBanOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState("");
  const [notice, setNotice] = useState("");

  const user = userQuery.data?.data;

  useEffect(() => {
    const rate = user?.professionalProfile?.defaultCommissionRate;
    setCommissionRateDraft(rate != null ? String(Math.round(rate * 100)) : "");
  }, [user?.professionalProfile?.defaultCommissionRate]);

  if (userQuery.isLoading) {
    return (
      <AdminLayout title={t("admin.userDetail.loadingTitle")} description={t("admin.userDetail.description")}>
        <p className="text-[13px] text-slate-400">{t("admin.userDetail.loadingDetail")}</p>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title={t("admin.userDetail.notFoundTitle")} description={t("admin.userDetail.description")}>
        <p className="text-[13px] text-red-300">{t("admin.userDetail.notFoundDesc")}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${user.firstName} ${user.lastName}`} description={t("admin.userDetail.description")}>
      <div className="mb-4">
        <Link to="/admin/utilisateurs" className="text-[13px] font-bold text-emerald-300 hover:text-emerald-200">
          {t("admin.userDetail.backToUsers")}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <AdminCard>
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-[22px] font-black text-[#111827]">
              {user.firstName.slice(0, 1)}{user.lastName.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-[20px] font-black text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-[13px] text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[13px]">
            <InfoRow label={t("admin.userDetail.role")} value={user.role} />
            <InfoRow label={t("admin.userDetail.country")} value={user.country} />
            <InfoRow label={t("admin.userDetail.status")} value={user.isBanned ? `${t("admin.userDetail.banned")}${user.banReason ? ` — ${user.banReason}` : ""}` : t("admin.userDetail.active")} />
            <InfoRow label={t("admin.userDetail.registration")} value={new Date(user.createdAt).toLocaleDateString("fr-FR")} />
            <InfoRow label="KYC" value={user.kycStatus} />
            <InfoRow label={t("admin.userDetail.walletBalance")} value={`${Number(user.walletBalance).toLocaleString("fr-FR")} FCFA`} />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex gap-2">
              <select value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)} className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
                <option value="">{t("admin.userDetail.changeRole")}</option>
                {assignableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <button
                type="button"
                disabled={!roleDraft || updateRole.isPending}
                onClick={() =>
                  updateRole.mutate(
                    { id: user.id, role: roleDraft },
                    {
                      onSuccess: () => setNotice(t("admin.userDetail.roleUpdated")),
                      onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.userDetail.roleUpdateError")),
                    },
                  )
                }
                className="rounded-lg bg-emerald-400 px-4 text-[13px] font-bold text-[#111827] disabled:opacity-50"
              >
                {t("admin.userDetail.apply")}
              </button>
            </div>

            {user.professionalProfile && actorRoles.includes("super_admin") && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder={t("admin.userDetail.negotiatedCommissionPlaceholder")}
                  value={commissionRateDraft}
                  onChange={(event) => setCommissionRateDraft(event.target.value)}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
                />
                <button
                  type="button"
                  disabled={updateCommissionRate.isPending}
                  onClick={() =>
                    updateCommissionRate.mutate(
                      {
                        profileId: user.professionalProfile!.id,
                        userId: user.id,
                        defaultCommissionRate: commissionRateDraft.trim() === "" ? null : Number(commissionRateDraft),
                      },
                      {
                        onSuccess: () => setNotice(t("admin.userDetail.commissionUpdated")),
                        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.userDetail.commissionUpdateError")),
                      },
                    )
                  }
                  className="rounded-lg bg-emerald-400 px-4 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  {t("admin.userDetail.save")}
                </button>
              </div>
            )}

            {user.professionalProfile && (
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-300">{t("admin.userDetail.portraitOfWeek")}</span>
                  {user.professionalProfile.isPortraitOfWeek && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-300">
                      {user.professionalProfile.portraitEndDate ? t("admin.userDetail.portraitActiveUntil", { date: new Date(user.professionalProfile.portraitEndDate).toLocaleDateString("fr-FR") }) : t("admin.userDetail.portraitActive")}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={portraitStart}
                    onChange={(event) => setPortraitStart(event.target.value)}
                    className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
                  />
                  <input
                    type="date"
                    value={portraitEnd}
                    onChange={(event) => setPortraitEnd(event.target.value)}
                    className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
                  />
                </div>
                <button
                  type="button"
                  disabled={!portraitStart || !portraitEnd || setPortraitOfWeek.isPending}
                  onClick={() =>
                    setPortraitOfWeek.mutate(
                      { profileId: user.professionalProfile!.id, userId: user.id, startDate: portraitStart, endDate: portraitEnd },
                      {
                        onSuccess: () => setNotice(t("admin.userDetail.portraitConfigured")),
                        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.userDetail.portraitConfigureError")),
                      },
                    )
                  }
                  className="w-full rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  {t("admin.userDetail.setAsPortraitOfWeek")}
                </button>
              </div>
            )}

            {user.isBanned ? (
              <button
                type="button"
                disabled={unban.isPending}
                onClick={() => unban.mutate(user.id, { onSuccess: () => setNotice(t("admin.userDetail.accountUnbanned")) })}
                className="w-full rounded-lg bg-emerald-400 px-4 py-3 text-[13px] font-bold text-[#111827] disabled:opacity-50"
              >
                {t("admin.userDetail.unbanAccount")}
              </button>
            ) : (
              <button type="button" onClick={() => setBanOpen(true)} className="w-full rounded-lg bg-red-500/80 px-4 py-3 text-[13px] font-bold text-white">
                {t("admin.userDetail.suspendAccount")}
              </button>
            )}

            {user.kycStatus === "SUBMITTED" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={approveKyc.isPending}
                  onClick={() => approveKyc.mutate(user.id, { onSuccess: () => setNotice(t("admin.userDetail.kycApproved")) })}
                  className="flex-1 rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  {t("admin.userDetail.approveKyc")}
                </button>
                <button
                  type="button"
                  disabled={rejectKyc.isPending}
                  onClick={() => rejectKyc.mutate(user.id, { onSuccess: () => setNotice(t("admin.userDetail.kycRejected")) })}
                  className="flex-1 rounded-lg bg-red-500/80 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                >
                  {t("admin.userDetail.rejectKyc")}
                </button>
              </div>
            )}
          </div>

          {notice && (
            <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-[12px] font-semibold text-emerald-200">
              {notice}
            </p>
          )}
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.userDetail.reputationActivity")}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">{t("admin.userDetail.reputationScore")}</p>
                <p className="mt-2 text-[24px] font-black text-white">{user.reputationScore}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">{t("admin.userDetail.lastLogin")}</p>
                <p className="mt-2 text-[16px] font-bold text-white">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR") : t("admin.userDetail.never")}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">{t("admin.userDetail.emailVerified")}</p>
                <p className="mt-2 text-[16px] font-bold text-white">{user.isActive ? t("admin.userDetail.yes") : t("admin.userDetail.accountDisabled")}</p>
              </div>
            </div>
          </AdminCard>

          {user.kycStatus !== "PENDING" && (
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.userDetail.kycDocuments")}</h2>
              {kycDocsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.userDetail.loadingDocuments")}</p>}
              {kycDocsQuery.isError && <p className="text-[13px] text-red-300">{t("admin.userDetail.loadDocumentsError")}</p>}
              {(() => {
                const record = kycDocsQuery.data?.data as
                  | { kycDocuments?: { docType?: string; documentNumber?: string; expiresAt?: string; files?: { front?: string; back?: string; selfie?: string } } | null }
                  | undefined;
                const docs = record?.kycDocuments;
                if (!kycDocsQuery.isLoading && !docs) {
                  return <p className="text-[13px] text-slate-400">{t("admin.userDetail.noDocumentsAvailable")}</p>;
                }
                if (!docs) return null;
                const links: Array<[string, string | undefined]> = [
                  [t("admin.userDetail.front"), docs.files?.front],
                  [t("admin.userDetail.back"), docs.files?.back],
                  [t("admin.userDetail.selfie"), docs.files?.selfie],
                ];
                return (
                  <div className="space-y-3 text-[13px]">
                    <InfoRow label={t("admin.userDetail.documentType")} value={docs.docType ?? "—"} />
                    <InfoRow label={t("admin.userDetail.documentNumber")} value={docs.documentNumber ?? "—"} />
                    <InfoRow label={t("admin.userDetail.expiresOn")} value={docs.expiresAt ? new Date(docs.expiresAt).toLocaleDateString("fr-FR") : "—"} />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {links.map(([label, url]) => url ? (
                        <a
                          key={label}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white/10 px-3 py-2 font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          {t("admin.userDetail.view", { label })}
                        </a>
                      ) : null)}
                    </div>
                  </div>
                );
              })()}
            </AdminCard>
          )}

          <UserPermissionsPanel user={user} canEdit={actorRoles.includes("super_admin")} />
        </div>
      </div>

      <ConfirmDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title={t("admin.userDetail.suspendTitle", { name: `${user.firstName} ${user.lastName}` })}
        description={t("admin.userDetail.suspendDesc")}
        danger
        requireReason
        reasonLabel={t("admin.userDetail.suspendReasonLabel")}
        confirmLabel={t("admin.userDetail.suspendConfirm")}
        pending={ban.isPending}
        onConfirm={(reason) => {
          if (!reason) return;
          ban.mutate({ id: user.id, reason }, { onSuccess: () => { setBanOpen(false); setNotice(t("admin.userDetail.accountSuspended")); } });
        }}
      />
    </AdminLayout>
  );
}

function UserPermissionsPanel({ user, canEdit }: { user: AdminUser; canEdit: boolean }) {
  const { t } = useTranslation();
  const permissionsQuery = useAdminPermissions();
  const updateOverrides = useUpdateUserPermissionOverrides();
  const [effective, setEffective] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");

  const catalog = permissionsQuery.data?.data?.catalog ?? [];
  const roleDefaults = useMemo(
    () => new Set(permissionsQuery.data?.data?.rolePermissions?.[user.role] ?? []),
    [permissionsQuery.data, user.role],
  );

  useEffect(() => {
    const overrides = user.permissionOverrides;
    const next = new Set(roleDefaults);
    overrides?.grant?.forEach((permission) => next.add(permission));
    overrides?.revoke?.forEach((permission) => next.delete(permission));
    setEffective(next);
  }, [roleDefaults, user.permissionOverrides]);

  if (user.role === "SUPER_ADMIN") {
    return (
      <AdminCard>
        <h2 className="mb-2 text-[18px] font-bold text-white">{t("admin.userDetail.individualPermissions")}</h2>
        <p className="text-[13px] text-slate-400">{t("admin.userDetail.superAdminAlwaysAllPerms")}</p>
      </AdminCard>
    );
  }

  // This endpoint is hardcoded to SUPER_ADMIN server-side (not a configurable
  // permission), unlike most other admin actions — show it read-only instead
  // of offering controls that would 403 for any other admin role.
  if (!canEdit) {
    return (
      <AdminCard>
        <h2 className="mb-2 text-[18px] font-bold text-white">{t("admin.userDetail.individualPermissions")}</h2>
        <p className="text-[13px] text-slate-400">{t("admin.userDetail.reservedForSuperAdmin")}</p>
      </AdminCard>
    );
  }

  const toggle = (permission: string) => {
    setEffective((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const save = () => {
    const grant = catalog.filter((entry) => effective.has(entry.key) && !roleDefaults.has(entry.key)).map((entry) => entry.key);
    const revoke = catalog.filter((entry) => !effective.has(entry.key) && roleDefaults.has(entry.key)).map((entry) => entry.key);
    updateOverrides.mutate(
      { id: user.id, grant, revoke },
      {
        onSuccess: () => setNotice(t("admin.userDetail.permissionsUpdated")),
        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.userDetail.permissionsUpdateError")),
      },
    );
  };

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-white">{t("admin.userDetail.individualPermissions")}</h2>
          <p className="mt-1 text-[12px] text-slate-500">
            {t("admin.userDetail.preCheckedByRole", { role: user.role })}
          </p>
        </div>
        <button
          type="button"
          disabled={updateOverrides.isPending || permissionsQuery.isLoading}
          onClick={save}
          className="rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
        >
          {updateOverrides.isPending ? t("admin.userDetail.saving") : t("admin.userDetail.save")}
        </button>
      </div>
      {notice && <p className="mb-3 text-[12px] font-semibold text-emerald-300">{notice}</p>}
      {permissionsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.userDetail.loading")}</p>}
      <div className="grid gap-2 md:grid-cols-2">
        {catalog.map((entry) => (
          <label key={entry.key} className="flex items-center gap-2 text-[13px] text-slate-300">
            <input type="checkbox" checked={effective.has(entry.key)} onChange={() => toggle(entry.key)} className="h-4 w-4 accent-emerald-400" />
            {entry.label}
          </label>
        ))}
      </div>
    </AdminCard>
  );
}
