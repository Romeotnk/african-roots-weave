import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminKycActions, useAdminModerationActions, useAdminUsers, usePendingProfessionals } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/utilisateurs/kyc")({
  head: () => ({ meta: [{ title: "Admin KYC - IWOSAN" }] }),
  component: AdminKycQueue,
});

type PendingProfessional = {
  id: string;
  displayName: string;
  location: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
};

function AdminKycQueue() {
  const usersQuery = useAdminUsers({ kyc: "SUBMITTED", limit: 50 });
  const { approve, reject } = useAdminKycActions();
  const professionalsQuery = usePendingProfessionals();
  const { verifyProfessional, rejectProfessional } = useAdminModerationActions();
  const [notice, setNotice] = useState("");
  const [rejectTarget, setRejectTarget] = useState<PendingProfessional | null>(null);

  const users = usersQuery.data?.data ?? [];
  const professionals = (professionalsQuery.data?.data ?? []) as PendingProfessional[];

  return (
    <AdminLayout title="KYC en attente" description="Documents soumis, approbation et rejet.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {usersQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {usersQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger la file KYC.</p>}

      {!usersQuery.isLoading && !usersQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Utilisateur", "Pays", "Soumis le", "Statut", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun dossier KYC en attente.</td></tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-slate-200">
                    <Link to="/admin/utilisateurs/$id" params={{ id: user.id }} className="font-semibold text-white hover:text-emerald-300">
                      {user.firstName} {user.lastName}
                    </Link>
                    <p className="text-[12px] text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{user.country}</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-300">{user.kycStatus}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(user.id, { onSuccess: () => setNotice(`KYC approuvé pour ${user.firstName} ${user.lastName}.`) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        Approuver
                      </button>
                      <button
                        type="button"
                        disabled={reject.isPending}
                        onClick={() => reject.mutate(user.id, { onSuccess: () => setNotice(`KYC rejeté pour ${user.firstName} ${user.lastName}.`) })}
                        className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-4 mt-8 text-[18px] font-bold text-white">Profils professionnels en attente</h2>

      {professionalsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {professionalsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger la file des profils.</p>}

      {!professionalsQuery.isLoading && !professionalsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Profil", "Utilisateur", "Localisation", "Soumis le", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {professionals.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun profil professionnel en attente.</td></tr>
              )}
              {professionals.map((profile) => (
                <tr key={profile.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{profile.displayName}</td>
                  <td className="px-4 py-3 text-slate-200">{profile.user.firstName} {profile.user.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{profile.location}</td>
                  <td className="px-4 py-3 text-slate-200">{new Date(profile.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={verifyProfessional.isPending}
                        onClick={() => verifyProfessional.mutate(profile.id, { onSuccess: () => setNotice(`Profil « ${profile.displayName} » vérifié.`) })}
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        Vérifier
                      </button>
                      <button type="button" onClick={() => setRejectTarget(profile)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={`Rejeter le profil « ${rejectTarget?.displayName ?? ""} »`}
        description="Le profil sera supprimé ; l'utilisateur pourra soumettre une nouvelle candidature."
        danger
        requireReason
        reasonLabel="Motif du rejet"
        confirmLabel="Rejeter"
        pending={rejectProfessional.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget || !reason) return;
          rejectProfessional.mutate(
            { id: rejectTarget.id, reason },
            { onSuccess: () => { setNotice(`Profil « ${rejectTarget.displayName} » rejeté.`); setRejectTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
