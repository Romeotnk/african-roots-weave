import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Copy, Link2, MousePointerClick, Wallet } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/shared/StatCard";
import { useMyAffiliateCommissions, useMyAffiliateLink } from "@/hooks/useAffiliateApi";

export const Route = createFileRoute("/tableau-de-bord/affiliation")({
  head: () => ({ meta: [{ title: "Programme d'affiliation - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AffiliationPage />
    </ProtectedRoute>
  ),
});

const buildStatusLabels = (t: TFunction): Record<string, string> => ({
  PENDING: t("dashboard.affiliation.statusPending"),
  APPROVED: t("dashboard.affiliation.statusApproved"),
  PAID: t("dashboard.affiliation.statusPaid"),
  CANCELLED: t("dashboard.affiliation.statusCancelled"),
});

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function AffiliationPage() {
  const { t } = useTranslation();
  const statusLabels = buildStatusLabels(t);
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
      title={t("dashboard.affiliation.title")}
      description={t("dashboard.affiliation.description")}
    >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={MousePointerClick} label={t("dashboard.affiliation.clicks")} value={String(affiliateLink?.clicks ?? 0)} />
          <StatCard icon={Wallet} label={t("dashboard.affiliation.paid")} value={formatMoney(paidTotal)} />
          <StatCard icon={CheckCircle2} label={t("dashboard.affiliation.upcoming")} value={formatMoney(pendingTotal)} />
        </div>

        <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[18px] font-bold"><Link2 size={18} /> {t("dashboard.affiliation.myLinkTitle")}</h2>
          {isLoading ? (
            <p className="mt-3 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.affiliation.loading")}</p>
          ) : (
            <>
              <p className="mt-3 break-all rounded-lg bg-[var(--brand-surface-alt)] px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
                {affiliateLink?.link}
              </p>
              <button type="button" onClick={copyLink} className="btn-primary mt-3 h-11 px-5 text-[14px]">
                <Copy size={16} /> {copied ? t("dashboard.affiliation.linkCopied") : t("dashboard.affiliation.copyLink")}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">{t("dashboard.affiliation.commissionsTitle")}</h2>
          <div className="mt-4 space-y-3">
            {list.length === 0 ? (
              <p className="text-[14px] text-[var(--color-text-muted)]">{t("dashboard.affiliation.noCommissions")}</p>
            ) : (
              list.map((commission) => (
                <div key={commission.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--brand-border-light)] p-3">
                  <div>
                    <p className="text-[14px] font-semibold">{commission.sourceOrder?.product?.title ?? t("dashboard.affiliation.order")}</p>
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

