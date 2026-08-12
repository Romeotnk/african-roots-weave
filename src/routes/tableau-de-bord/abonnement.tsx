import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CreditCard, Download, Layers, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
const formatMoney = (amount: number) => (amount === 0 ? "Gratuit" : `${amount.toLocaleString("fr-FR")} FCFA/mois`);
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");

function SubscriptionPage() {
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
        `Confirmer le passage au forfait ${plan.label} pour ${formatMoney(plan.price)} ? Le montant sera débité de votre portefeuille.`,
      );
      if (!confirmed) return;
    }

    setPendingPlan(planKey);
    upgrade.mutate(
      { plan: planKey, autoRenew },
      {
        onSuccess: () => {
          setFeedback(`Forfait ${plan.label} activé.`);
          setPendingPlan(null);
        },
        onError: (error: unknown) => {
          setFeedback(error instanceof Error ? error.message : "Échec de la mise à jour de l'abonnement.");
          setPendingPlan(null);
        },
      },
    );
  };

  const isLoading = plansLoading || subscriptionLoading;

  return (
    <AccountLayout
      title="Mon abonnement"
      description="Choisissez le forfait adapté à votre activité : nombre d'annonces actives et de téléchargements de produits numériques."
    >
        {isLoading ? (
          <p className="text-[14px] text-[var(--color-text-muted)]">Chargement...</p>
        ) : (
          <>
            {subscription && (
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  icon={Layers}
                  label="Forfait actuel"
                  value={plans?.[subscription.plan]?.label ?? subscription.plan}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Annonces actives"
                  value={`${subscription.activeListings} / ${subscription.maxListings}`}
                />
                <StatCard
                  icon={RefreshCw}
                  label="Renouvellement"
                  value={subscription.plan === "FREE" ? "-" : subscription.autoRenew ? `Auto — ${formatDate(subscription.endDate)}` : formatDate(subscription.endDate)}
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
              <label htmlFor="autoRenew">Activer le renouvellement automatique (débit du portefeuille tous les 30 jours)</label>
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
                          <Layers size={14} /> {plan.maxListings} annonces actives
                        </li>
                        <li className="flex items-center gap-2">
                          <Download size={14} /> {plan.maxDownloads} téléchargements / produit numérique
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
                          "Forfait actuel"
                        ) : (
                          <>
                            <CreditCard size={16} /> Choisir
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

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
