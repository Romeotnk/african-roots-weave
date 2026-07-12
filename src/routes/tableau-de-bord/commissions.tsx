import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Banknote, CheckCircle2, Copy, Download, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

type CommissionStatus = "available" | "pending" | "paid";

type Commission = {
  id: string;
  source: string;
  level: string;
  amount: number;
  status: CommissionStatus;
  date: string;
};

const initialCommissions: Commission[] = [
  { id: "com-1", source: "Pack formation Ayurveda", level: "Affiliation directe", amount: 9500, status: "available", date: "08/07/2026" },
  { id: "com-2", source: "Abonnement Pro", level: "Niveau 2", amount: 4200, status: "pending", date: "07/07/2026" },
  { id: "com-3", source: "Huile essentielle", level: "Affiliation directe", amount: 2100, status: "paid", date: "02/07/2026" },
];

const statusLabels: Record<CommissionStatus, string> = {
  available: "Disponible",
  pending: "En attente",
  paid: "Payee",
};

const statusClasses: Record<CommissionStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-blue-50 text-blue-700 border-blue-100",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function CommissionsPage() {
  const [commissions, setCommissions] = useState(initialCommissions);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionStatus>("all");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(
    () => ({
      available: commissions.filter((commission) => commission.status === "available").reduce((sum, commission) => sum + commission.amount, 0),
      pending: commissions.filter((commission) => commission.status === "pending").reduce((sum, commission) => sum + commission.amount, 0),
      paid: commissions.filter((commission) => commission.status === "paid").reduce((sum, commission) => sum + commission.amount, 0),
    }),
    [commissions],
  );

  const filteredCommissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return commissions.filter((commission) => {
      const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [commission.source, commission.level, commission.date].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [commissions, query, statusFilter]);

  const requestWithdrawal = () => {
    const amount = Number(withdrawAmount);
    setMessage("");
    setError("");

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Saisissez un montant valide avant de demander un retrait.");
      return;
    }

    if (amount > totals.available) {
      setError("Le montant demande depasse le solde disponible.");
      return;
    }

    let remaining = amount;
    setCommissions((current) =>
      current.map((commission) => {
        if (commission.status !== "available" || remaining <= 0) return commission;
        remaining -= commission.amount;
        return { ...commission, status: "pending" };
      }),
    );
    setWithdrawAmount("");
    setMessage("Demande de retrait enregistree. Elle restera en attente jusqu'a validation admin.");
  };

  const copyAffiliateLink = async () => {
    setError("");
    setMessage("");
    try {
      await navigator.clipboard.writeText("https://iwosan.com?ref=mon-code");
      setMessage("Lien d'affiliation copie.");
    } catch {
      setError("Impossible de copier automatiquement le lien. Copiez-le manuellement depuis votre navigateur.");
    }
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Reseau</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">Commissions</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Suivez vos gains d'affiliation et preparez les demandes de retrait sans activer le paiement.
                </p>
              </div>
              <button type="button" onClick={copyAffiliateLink} className="btn-secondary h-11 px-5 text-[14px]">
                <Copy size={17} /> Copier le lien
              </button>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Wallet} label="Disponible" value={formatMoney(totals.available)} />
            <StatCard icon={Banknote} label="En attente" value={formatMoney(totals.pending)} />
            <StatCard icon={CheckCircle2} label="Deja paye" value={formatMoney(totals.paid)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher une source ou un niveau"
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "available", "pending", "paid"] as const).map((status) => (
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
                {filteredCommissions.length === 0 ? (
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
                          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">{commission.source}</p>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{commission.level} - {commission.date}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-extrabold text-[var(--brand-primary)]">{formatMoney(commission.amount)}</span>
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
              <h2 className="text-[18px] font-bold">Demande de retrait</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                Le paiement reste desactive pour l'instant. Cette action cree seulement une demande de validation.
              </p>
              <label className="mt-5 block text-[13px] font-bold text-[var(--color-text-primary)]">
                Montant a demander
                <input
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  inputMode="numeric"
                  placeholder="Ex: 5000"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <button type="button" onClick={requestWithdrawal} className="btn-primary mt-4 h-11 w-full text-[14px]">
                <Download size={17} /> Enregistrer la demande
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </aside>
          </div>
        </section>
      </main>
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