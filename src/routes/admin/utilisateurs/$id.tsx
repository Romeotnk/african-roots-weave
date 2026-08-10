import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

const allRoles = ["USER", "PROFESSIONAL", "RESEARCHER", "MODERATOR", "EDITOR", "ADMIN", "SUPER_ADMIN"];
// Mirrors adminAssignableRoles in server/src/controllers/admin.controller.ts:
// a non-SUPER_ADMIN admin may only assign these three roles — anything else
// 403s. Filtering the options here avoids offering choices that silently fail.
const adminAssignableRoles = ["MODERATOR", "EDITOR", "RESEARCHER"];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}

function AdminUserDetail() {
  const { id } = Route.useParams();
  const { roles: actorRoles } = useAuth();
  const assignableRoles = actorRoles.includes("super_admin") ? allRoles : adminAssignableRoles;
  const userQuery = useAdminUser(id);
  const { ban, unban, updateRole, updateCommissionRate } = useAdminUserActions();
  const [commissionRateDraft, setCommissionRateDraft] = useState("");
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
      <AdminLayout title="Chargement..." description="Fiche utilisateur, rôles, statut, KYC et historique.">
        <p className="text-[13px] text-slate-400">Chargement de la fiche...</p>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="Utilisateur introuvable" description="Fiche utilisateur, rôles, statut, KYC et historique.">
        <p className="text-[13px] text-red-300">Cet utilisateur n'existe pas ou n'a pas pu être chargé.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${user.firstName} ${user.lastName}`} description="Fiche utilisateur, rôles, statut, KYC et historique.">
      <div className="mb-4">
        <Link to="/admin/utilisateurs" className="text-[13px] font-bold text-emerald-300 hover:text-emerald-200">
          Retour aux utilisateurs
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
            <InfoRow label="Rôle" value={user.adminSubRole ? `${user.role} (${user.adminSubRole})` : user.role} />
            <InfoRow label="Pays" value={user.country} />
            <InfoRow label="Statut" value={user.isBanned ? `Banni${user.banReason ? ` — ${user.banReason}` : ""}` : "Actif"} />
            <InfoRow label="Inscription" value={new Date(user.createdAt).toLocaleDateString("fr-FR")} />
            <InfoRow label="KYC" value={user.kycStatus} />
            <InfoRow label="Solde wallet" value={`${Number(user.walletBalance).toLocaleString("fr-FR")} FCFA`} />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex gap-2">
              <select value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)} className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white">
                <option value="">Changer le rôle...</option>
                {assignableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <button
                type="button"
                disabled={!roleDraft || updateRole.isPending}
                onClick={() =>
                  updateRole.mutate(
                    { id: user.id, role: roleDraft },
                    {
                      onSuccess: () => setNotice("Rôle mis à jour."),
                      onError: (error) => setNotice(error instanceof Error ? error.message : "Impossible de changer ce rôle."),
                    },
                  )
                }
                className="rounded-lg bg-emerald-400 px-4 text-[13px] font-bold text-[#111827] disabled:opacity-50"
              >
                Appliquer
              </button>
            </div>

            {user.professionalProfile && actorRoles.includes("super_admin") && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Taux commission négocié (%)"
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
                        onSuccess: () => setNotice("Taux de commission négocié mis à jour."),
                        onError: (error) => setNotice(error instanceof Error ? error.message : "Impossible de mettre à jour le taux de commission."),
                      },
                    )
                  }
                  className="rounded-lg bg-emerald-400 px-4 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            )}

            {user.isBanned ? (
              <button
                type="button"
                disabled={unban.isPending}
                onClick={() => unban.mutate(user.id, { onSuccess: () => setNotice("Compte débanni.") })}
                className="w-full rounded-lg bg-emerald-400 px-4 py-3 text-[13px] font-bold text-[#111827] disabled:opacity-50"
              >
                Débannir le compte
              </button>
            ) : (
              <button type="button" onClick={() => setBanOpen(true)} className="w-full rounded-lg bg-red-500/80 px-4 py-3 text-[13px] font-bold text-white">
                Suspendre le compte
              </button>
            )}

            {user.kycStatus === "SUBMITTED" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={approveKyc.isPending}
                  onClick={() => approveKyc.mutate(user.id, { onSuccess: () => setNotice("KYC approuvé.") })}
                  className="flex-1 rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  Approuver le KYC
                </button>
                <button
                  type="button"
                  disabled={rejectKyc.isPending}
                  onClick={() => rejectKyc.mutate(user.id, { onSuccess: () => setNotice("KYC rejeté.") })}
                  className="flex-1 rounded-lg bg-red-500/80 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                >
                  Rejeter le KYC
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
            <h2 className="mb-4 text-[18px] font-bold text-white">Réputation & activité</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Score de réputation</p>
                <p className="mt-2 text-[24px] font-black text-white">{user.reputationScore}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Dernière connexion</p>
                <p className="mt-2 text-[16px] font-bold text-white">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR") : "Jamais"}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Email vérifié</p>
                <p className="mt-2 text-[16px] font-bold text-white">{user.isActive ? "Oui" : "Compte désactivé"}</p>
              </div>
            </div>
          </AdminCard>

          {user.kycStatus !== "PENDING" && (
            <AdminCard>
              <h2 className="mb-4 text-[18px] font-bold text-white">Documents KYC</h2>
              {kycDocsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement des documents...</p>}
              {kycDocsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les documents.</p>}
              {(() => {
                const record = kycDocsQuery.data?.data as
                  | { kycDocuments?: { docType?: string; documentNumber?: string; expiresAt?: string; files?: { front?: string; back?: string; selfie?: string } } | null }
                  | undefined;
                const docs = record?.kycDocuments;
                if (!kycDocsQuery.isLoading && !docs) {
                  return <p className="text-[13px] text-slate-400">Aucun document disponible.</p>;
                }
                if (!docs) return null;
                const links: Array<[string, string | undefined]> = [
                  ["Recto", docs.files?.front],
                  ["Verso", docs.files?.back],
                  ["Selfie", docs.files?.selfie],
                ];
                return (
                  <div className="space-y-3 text-[13px]">
                    <InfoRow label="Type de document" value={docs.docType ?? "—"} />
                    <InfoRow label="Numéro" value={docs.documentNumber ?? "—"} />
                    <InfoRow label="Expire le" value={docs.expiresAt ? new Date(docs.expiresAt).toLocaleDateString("fr-FR") : "—"} />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {links.map(([label, url]) => url ? (
                        <a
                          key={label}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white/10 px-3 py-2 font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          Voir : {label}
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
        title={`Suspendre ${user.firstName} ${user.lastName}`}
        description="Le compte sera immédiatement bloqué. Indiquez un motif conservé dans l'historique de modération."
        danger
        requireReason
        reasonLabel="Motif de la suspension"
        confirmLabel="Suspendre"
        pending={ban.isPending}
        onConfirm={(reason) => {
          if (!reason) return;
          ban.mutate({ id: user.id, reason }, { onSuccess: () => { setBanOpen(false); setNotice("Compte suspendu."); } });
        }}
      />
    </AdminLayout>
  );
}

function UserPermissionsPanel({ user, canEdit }: { user: AdminUser; canEdit: boolean }) {
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
        <h2 className="mb-2 text-[18px] font-bold text-white">Permissions individuelles</h2>
        <p className="text-[13px] text-slate-400">Le rôle Super admin a toujours accès à toutes les permissions.</p>
      </AdminCard>
    );
  }

  // This endpoint is hardcoded to SUPER_ADMIN server-side (not a configurable
  // permission), unlike most other admin actions — show it read-only instead
  // of offering controls that would 403 for any other admin role.
  if (!canEdit) {
    return (
      <AdminCard>
        <h2 className="mb-2 text-[18px] font-bold text-white">Permissions individuelles</h2>
        <p className="text-[13px] text-slate-400">Réservé au rôle Super admin.</p>
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
        onSuccess: () => setNotice("Permissions individuelles mises à jour."),
        onError: (error) => setNotice(error instanceof Error ? error.message : "Impossible de mettre à jour les permissions."),
      },
    );
  };

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-white">Permissions individuelles</h2>
          <p className="mt-1 text-[12px] text-slate-500">
            Cases pré-cochées = accordées par le rôle « {user.role} ». Décochez ou cochez pour composer un accès personnalisé.
          </p>
        </div>
        <button
          type="button"
          disabled={updateOverrides.isPending || permissionsQuery.isLoading}
          onClick={save}
          className="rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
        >
          {updateOverrides.isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      {notice && <p className="mb-3 text-[12px] font-semibold text-emerald-300">{notice}</p>}
      {permissionsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
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
