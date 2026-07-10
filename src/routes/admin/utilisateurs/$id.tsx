import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard, AdminLayout, AdminTable } from "@/components/admin/AdminLayout";
import { adminFinance, adminKycQueue, adminUsers } from "@/data/admin";

export const Route = createFileRoute("/admin/utilisateurs/$id")({
  head: () => ({ meta: [{ title: "Fiche utilisateur admin - IWOSAN" }] }),
  component: AdminUserDetail,
});

function AdminUserDetail() {
  const { id } = Route.useParams();
  const user = adminUsers.find((item) => item.id === id) ?? adminUsers[0];
  const kyc = adminKycQueue.find((item) => item.user === user.name);
  const transactions = adminFinance.transactions.filter((item) => item.user === user.name);

  return (
    <AdminLayout title={user.name} description="Fiche utilisateur, rôles, statut, KYC et historique mock.">
      <div className="mb-4">
        <Link to="/admin/utilisateurs" className="text-[13px] font-bold text-emerald-300 hover:text-emerald-200">
          Retour aux utilisateurs
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <AdminCard>
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-[22px] font-black text-[#111827]">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[20px] font-black text-white">{user.name}</h2>
              <p className="text-[13px] text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[13px]">
            <InfoRow label="Rôle" value={user.role} />
            <InfoRow label="Pays" value={user.country} />
            <InfoRow label="Statut" value={user.status} />
            <InfoRow label="Inscription" value={user.joinedAt} />
            <InfoRow label="KYC" value={kyc ? kyc.status : "Aucun dossier"} />
          </div>

          <div className="mt-6 grid gap-2">
            {["Changer le rôle", "Suspendre le compte", "Réinitialiser le mot de passe", "Envoyer un message"].map((action) => (
              <button key={action} className="rounded-lg bg-white/5 px-4 py-3 text-left text-[13px] font-bold text-slate-200 hover:bg-white/10">
                {action}
              </button>
            ))}
          </div>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Activité et modération</h2>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Annonces", user.role === "Vendeur" ? "8" : "0"],
                ["Commandes", "12"],
                ["Avis", "5"],
                ["Signalements", user.status === "Suspendu" ? "2" : "0"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/5 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
                  <p className="mt-2 text-[24px] font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Transactions liées</h2>
            <AdminTable
              headers={["Date", "Type", "Montant", "Statut", "Reference"]}
              rows={(transactions.length ? transactions : adminFinance.transactions.slice(0, 3)).map((transaction) => [
                transaction.date,
                transaction.type,
                `${transaction.amount.toLocaleString("fr-FR")} XOF`,
                transaction.status,
                transaction.ref,
              ])}
            />
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Notes internes</h2>
            <textarea
              defaultValue="Historique support, décisions de modération et remarques internes visibles uniquement par les administrateurs."
              className="min-h-32 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-slate-200 outline-none"
            />
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}
