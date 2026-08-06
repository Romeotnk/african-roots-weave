import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Copy, Link2, MousePointerClick, Wallet } from "lucide-react";
import { useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMyAffiliateCommissions, useMyAffiliateLink } from "@/hooks/useAffiliateApi";

export const Route = createFileRoute("/tableau-de-bord/affiliation")({
  head: () => ({ meta: [{ title: "Programme d'affiliation - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <AffiliationPage />
    </ProtectedRoute>
  ),
});

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Calculée - versée à la livraison",
  PAID: "Versée au portefeuille",
  CANCELLED: "Annulée",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function AffiliationPage() {
  const { data: affiliateLink, isLoading } = useMyAffiliateLink();
  const { data: commissions } = useMyAffiliateCommissions();
  const [copied, setCopied] = useState(false);
  const list = commissions ?? [];
  const paidTotal = list.filter((c) => c.status === "PAID").reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingTotal = list.filter((c) => c.status === "APPROVED").reduce((sum, c) => sum + Number(c.amount), 0);

  const copyLink = async () => {
    if (!affiliateLink?.link) return;
    try {
      await navigator.clipboard.writeText(affiliateLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AccountLayout
      title="Programme d'affiliation"
      description="Partagez votre lien unique : vous percevez une commission sur chaque vente qu'il génère, indépendamment de votre réseau MLM."
    >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={MousePointerClick} label="Clics" value={String(affiliateLink?.clicks ?? 0)} />
          <StatCard icon={Wallet} label="Versées" value={formatMoney(paidTotal)} />
          <StatCard icon={CheckCircle2} label="À venir" value={formatMoney(pendingTotal)} />
        </div>

        <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[18px] font-bold"><Link2 size={18} /> Mon lien d'affiliation</h2>
          {isLoading ? (
            <p className="mt-3 text-[14px] text-[var(--color-text-muted)]">Chargement...</p>
          ) : (
            <>
              <p className="mt-3 break-all rounded-lg bg-[var(--brand-surface-alt)] px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
                {affiliateLink?.link}
              </p>
              <button type="button" onClick={copyLink} className="btn-primary mt-3 h-11 px-5 text-[14px]">
                <Copy size={16} /> {copied ? "Lien copié !" : "Copier le lien"}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">Commissions d'affiliation</h2>
          <div className="mt-4 space-y-3">
            {list.length === 0 ? (
              <p className="text-[14px] text-[var(--color-text-muted)]">Aucune commission pour le moment. Partagez votre lien pour commencer.</p>
            ) : (
              list.map((commission) => (
                <div key={commission.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--brand-border-light)] p-3">
                  <div>
                    <p className="text-[14px] font-semibold">{commission.sourceOrder?.product?.title ?? "Commande"}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{new Date(commission.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[var(--brand-primary)]">{formatMoney(Number(commission.amount))}</span>
                    <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">
                      {statusLabels[commission.status] ?? commission.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </AccountLayout>
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
