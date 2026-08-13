import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const usersQuery = useAdminUsers({ kyc: "SUBMITTED", limit: 50 });
  const { approve, reject } = useAdminKycActions();
  const professionalsQuery = usePendingProfessionals();
  const { verifyProfessional, rejectProfessional } = useAdminModerationActions();
  const [notice, setNotice] = useState("");
  const [rejectTarget, setRejectTarget] = useState<PendingProfessional | null>(null);

  const users = usersQuery.data?.data ?? [];
  const professionals = (professionalsQuery.data?.data ?? []) as PendingProfessional[];

  return (
    <AdminLayout title={t("admin.kycQueue.title")} description={t("admin.kycQueue.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {usersQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.kycQueue.loading")}</p>}
      {usersQuery.isError && <p className="text-[13px] text-red-300">{t("admin.kycQueue.loadError")}</p>}

      {!usersQuery.isLoading && !usersQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.kycQueue.colUser"), t("admin.kycQueue.colCountry"), t("admin.kycQueue.colSubmittedOn"), t("admin.kycQueue.colStatus"), t("admin.kycQueue.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.kycQueue.noKycPending")}</td></tr>
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
                        onClick={() =>
                          approve.mutate(user.id, {
                            onSuccess: () => setNotice(t("admin.kycQueue.kycApprovedFor", { name: `${user.firstName} ${user.lastName}` })),
                            onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.kycQueue.approveError")),
                          })
                        }
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.kycQueue.approve")}
                      </button>
                      <button
                        type="button"
                        disabled={reject.isPending}
                        onClick={() =>
                          reject.mutate(user.id, {
                            onSuccess: () => setNotice(t("admin.kycQueue.kycRejectedFor", { name: `${user.firstName} ${user.lastName}` })),
                            onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.kycQueue.rejectError")),
                          })
                        }
                        className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        {t("admin.kycQueue.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-4 mt-8 text-[18px] font-bold text-white">{t("admin.kycQueue.pendingProfessionalProfiles")}</h2>

      {professionalsQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.kycQueue.loading")}</p>}
      {professionalsQuery.isError && <p className="text-[13px] text-red-300">{t("admin.kycQueue.loadProfilesError")}</p>}

      {!professionalsQuery.isLoading && !professionalsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.kycQueue.colProfile"), t("admin.kycQueue.colUser"), t("admin.kycQueue.colLocation"), t("admin.kycQueue.colSubmittedOn"), t("admin.kycQueue.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {professionals.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.kycQueue.noPendingProfiles")}</td></tr>
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
                        onClick={() =>
                          verifyProfessional.mutate(profile.id, {
                            onSuccess: () => setNotice(t("admin.kycQueue.profileVerified", { name: profile.displayName })),
                            onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.kycQueue.verifyError")),
                          })
                        }
                        className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                      >
                        {t("admin.kycQueue.verify")}
                      </button>
                      <button type="button" onClick={() => setRejectTarget(profile)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        {t("admin.kycQueue.reject")}
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
        title={t("admin.kycQueue.rejectProfileTitle", { name: rejectTarget?.displayName ?? "" })}
        description={t("admin.kycQueue.rejectProfileDesc")}
        danger
        requireReason
        reasonLabel={t("admin.kycQueue.rejectReasonLabel")}
        confirmLabel={t("admin.kycQueue.reject")}
        pending={rejectProfessional.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget || !reason) return;
          rejectProfessional.mutate(
            { id: rejectTarget.id, reason },
            {
              onSuccess: () => { setNotice(t("admin.kycQueue.profileRejected", { name: rejectTarget.displayName })); setRejectTarget(null); },
              onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.kycQueue.rejectProfileError")),
            },
          );
        }}
      />
    </AdminLayout>
  );
}
