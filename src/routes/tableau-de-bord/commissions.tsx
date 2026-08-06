import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Banknote, CheckCircle2, Copy, Loader2, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAffiliateLink, useMyCommissions } from "@/hooks/useMlmApi";
import type { MlmCommission } from "@/lib/api/mlm";

type CommissionStatus = MlmCommission["status"];

const statusLabels: Record<CommissionStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Calculee - versee a la livraison",
  PAID: "Versee au portefeuille",
  CANCELLED: "Annulee",
};

const statusClasses: Record<CommissionStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  APPROVED: "bg-amber-50 text-amber-700 border-amber-100",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

const levelLabels: Record<MlmCommission["type"], string> = {
  DIRECT: "Vente directe",
  MLM_LEVEL1: "Reseau - niveau 1",
  MLM_LEVEL2: "Reseau - niveau 2",
  MLM_LEVEL3: "Reseau - niveau 3",
  AFFILIATE: "Affiliation",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

function CommissionsPage() {
  const { data: commissions, isLoading, isError } = useMyCommissions();
  const { data: affiliate } = useAffiliateLink();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionStatus>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const list = commissions ?? [];

  const totals = useMemo(
    () => ({
      pendingPayout: list.filter((c) => c.status === "APPROVED").reduce((sum, c) => sum + Number(c.amount), 0),
      paid: list.filter((c) => c.status === "PAID").reduce((sum, c) => sum + Number(c.amount), 0),
    }),
    [list],
  );

  const filteredCommissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return list.filter((commission) => {
      const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
      const source = commission.sourceOrder?.product?.title ?? "Commande";
      const matchesQuery = normalizedQuery.length === 0 || source.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [list, query, statusFilter]);

  const copyAffiliateLink = async () => {
    setError("");
    setMessage("");
    if (!affiliate?.link) {
      setError("Votre lien d'affiliation n'est pas encore disponible.");
      return;
    }
    try {
      await navigator.clipboard.writeText(affiliate.link);
      setMessage("Lien d'affiliation copie.");
    } catch {
      setError("Impossible de copier automatiquement le lien. Copiez-le manuellement depuis votre navigateur.");
    }
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <AccountLayout
        title="Commissions"
        description="Suivez vos gains de vente directe, d'affiliation et de reseau."
        actions={
          <button type="button" onClick={copyAffiliateLink} className="btn-secondary h-11 px-5 text-[14px]">
            <Copy size={17} /> Copier le lien
          </button>
        }
      >
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard icon={Banknote} label="A venir (livraison confirmee)" value={formatMoney(totals.pendingPayout)} />
            <StatCard icon={CheckCircle2} label="Deja versee au portefeuille" value={formatMoney(totals.paid)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher une commande"
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "APPROVED", "PAID", "CANCELLED"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                        statusFilter === status
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {status === "all" ? "Toutes" : statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-10">
                    <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
                  </div>
                ) : isError ? (
                  <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                    Impossible de charger vos commissions pour le moment.
                  </div>
                ) : filteredCommissions.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <Wallet className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">Aucune commission trouvee</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez un autre filtre ou une autre recherche.</p>
                  </div>
                ) : (
                  filteredCommissions.map((commission) => (
                    <article key={commission.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
                            {commission.sourceOrder?.product?.title ?? "Commande"}
                          </p>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                            {levelLabels[commission.type]} - {formatDate(commission.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-extrabold text-[var(--brand-primary)]">{formatMoney(Number(commission.amount))}</span>
                          <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[commission.status]}`}>
                            {statusLabels[commission.status]}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">Retirer mes gains</h2>
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-muted)]">
                Les commissions versees sont automatiquement creditees sur votre portefeuille des la confirmation de livraison. Le retrait se fait depuis votre portefeuille.
              </p>
              <Link to="/mon-compte/portefeuille" className="btn-primary mt-4 flex h-11 w-full items-center justify-center text-[14px]">
                <Wallet size={17} /> Aller au portefeuille
              </Link>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </aside>
          </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/commissions")({
  head: () => ({ meta: [{ title: "Commissions - IWOSAN" }] }),
  component: CommissionsPage,
});
