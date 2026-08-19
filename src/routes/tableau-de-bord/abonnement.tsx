import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CreditCard, Download, Layers, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/shared/StatCard";
import { useMySubscription, useSubscriptionPlans, useUpgradeSubscription } from "@/hooks/useSubscriptionApi";
import type { SubscriptionPlanKey } from "@/lib/api/subscriptions";

export const Route = createFileRoute("/tableau-de-bord/abonnement")({
  head: () => ({ meta: [{ title: "Mon abonnement - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <SubscriptionPage />
    </ProtectedRoute>
  ),
});

const PLAN_ORDER: SubscriptionPlanKey[] = ["FREE", "BASIC", "PRO", "EXPERT"];
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");

function SubscriptionPage() {
  const { t } = useTranslation();
  const formatMoney = (amount: number) => (amount === 0 ? t("dashboard.subscription.free") : t("dashboard.subscription.priceMonthly", { amount: amount.toLocaleString("fr-FR") }));
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscription();
  const upgrade = useUpgradeSubscription();
  const [autoRenew, setAutoRenew] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlanKey | null>(null);

  const handleSelectPlan = (planKey: SubscriptionPlanKey) => {
    if (!plans) return;
    const plan = plans[planKey];
    setFeedback("");

    if (plan.price > 0) {
      const confirmed = window.confirm(
        t("dashboard.subscription.confirmUpgrade", { plan: plan.label, price: formatMoney(plan.price) }),
      );
      if (!confirmed) return;
    }

    setPendingPlan(planKey);
    upgrade.mutate(
      { plan: planKey, autoRenew },
      {
        onSuccess: () => {
          setFeedback(t("dashboard.subscription.planActivated", { plan: plan.label }));
          setPendingPlan(null);
        },
        onError: (error: unknown) => {
          setFeedback(error instanceof Error ? error.message : t("dashboard.subscription.upgradeError"));
          setPendingPlan(null);
        },
      },
    );
  };

  const isLoading = plansLoading || subscriptionLoading;

  return (
    <AccountLayout
      title={t("dashboard.subscription.title")}
      description={t("dashboard.subscription.description")}
    >
        {isLoading ? (
          <p className="text-[14px] text-[var(--color-text-muted)]">{t("dashboard.subscription.loading")}</p>
        ) : (
          <>
            {subscription && (
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  icon={Layers}
                  label={t("dashboard.subscription.currentPlan")}
                  value={plans?.[subscription.plan]?.label ?? subscription.plan}
                />
                <StatCard
                  icon={CheckCircle2}
                  label={t("dashboard.subscription.activeListings")}
                  value={`${subscription.activeListings} / ${subscription.maxListings}`}
                />
                <StatCard
                  icon={RefreshCw}
                  label={t("dashboard.subscription.renewal")}
                  value={subscription.plan === "FREE" ? "-" : subscription.autoRenew ? t("dashboard.subscription.autoRenewal", { date: formatDate(subscription.endDate) }) : formatDate(subscription.endDate)}
                />
              </div>
            )}

            {feedback && (
              <p className="mt-4 rounded-lg border border-[var(--brand-border-light)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
                {feedback}
              </p>
            )}

            <div className="mt-6 flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]">
              <input
                id="autoRenew"
                type="checkbox"
                checked={autoRenew}
                onChange={(event) => setAutoRenew(event.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="autoRenew">{t("dashboard.subscription.autoRenewLabel")}</label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans &&
                PLAN_ORDER.map((planKey) => {
                  const plan = plans[planKey];
                  const isCurrent = subscription?.plan === planKey && subscription.isActive;
                  const isPending = upgrade.isPending && pendingPlan === planKey;

                  return (
                    <div
                      key={planKey}
                      className={`flex flex-col rounded-[8px] border bg-white p-5 ${
                        isCurrent ? "border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]" : "border-[var(--brand-border-light)]"
                      }`}
                    >
                      <h2 className="text-[18px] font-bold">{plan.label}</h2>
                      <p className="mt-1 text-[22px] font-extrabold text-[var(--brand-primary)]">{formatMoney(plan.price)}</p>
                      <ul className="mt-4 flex-1 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
                        <li className="flex items-center gap-2">
                          <Layers size={14} /> {t("dashboard.subscription.listingsCount", { count: plan.maxListings })}
                        </li>
                        <li className="flex items-center gap-2">
                          <Download size={14} /> {t("dashboard.subscription.downloadsCount", { count: plan.maxDownloads })}
                        </li>
                      </ul>
                      <button
                        type="button"
                        disabled={isCurrent || upgrade.isPending}
                        onClick={() => handleSelectPlan(planKey)}
                        className={`mt-5 flex h-11 items-center justify-center gap-2 rounded-lg text-[14px] font-semibold ${
                          isCurrent
                            ? "cursor-default border border-[var(--brand-border-light)] text-[var(--color-text-muted)]"
                            : "btn-primary"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isCurrent ? (
                          t("dashboard.subscription.currentPlan")
                        ) : (
                          <>
                            <CreditCard size={16} /> {t("dashboard.subscription.choose")}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </>
        )}
    </AccountLayout>
  );
}

