import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminSubscriptionActions, useAdminSubscriptions } from "@/hooks/useAdminApi";
import type { AdminSubscription } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/finances/abonnements")({
  head: () => ({ meta: [{ title: "Admin abonnements - IWOSAN" }] }),
  component: AdminAbonnements,
});

const planLabel: Record<AdminSubscription["plan"], string> = {
  FREE: "Free",
  BASIC: "Basic",
  PRO: "Pro",
  EXPERT: "Expert",
};

const planDefaults: Record<AdminSubscription["plan"], { price: number; maxListings: number; maxDownloads: number }> = {
  FREE: { price: 0, maxListings: 5, maxDownloads: 10 },
  BASIC: { price: 5000, maxListings: 20, maxDownloads: 50 },
  PRO: { price: 15000, maxListings: 100, maxDownloads: 500 },
  EXPERT: { price: 35000, maxListings: 1000, maxDownloads: 5000 },
};

type EditForm = {
  plan: AdminSubscription["plan"];
  price: string;
  maxListings: string;
  maxDownloads: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
};

const toForm = (subscription: AdminSubscription): EditForm => ({
  plan: subscription.plan,
  price: String(subscription.price),
  maxListings: String(subscription.maxListings),
  maxDownloads: String(subscription.maxDownloads),
  endDate: subscription.endDate ? subscription.endDate.slice(0, 10) : "",
  isActive: subscription.isActive,
  autoRenew: subscription.autoRenew,
});

function AdminAbonnements() {
  const subscriptionsQuery = useAdminSubscriptions();
  const { update } = useAdminSubscriptionActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [notice, setNotice] = useState("");

  const subscriptions = subscriptionsQuery.data?.data ?? [];

  const startEdit = (subscription: AdminSubscription) => {
    setEditingId(subscription.id);
    setForm(toForm(subscription));
    setNotice("");
  };

  const applyPlanDefaults = (plan: AdminSubscription["plan"]) => {
    const defaults = planDefaults[plan];
    setForm((current) => (current ? { ...current, plan, price: String(defaults.price), maxListings: String(defaults.maxListings), maxDownloads: String(defaults.maxDownloads) } : current));
  };

  const saveEdit = () => {
    if (!editingId || !form) return;
    update.mutate(
      {
        id: editingId,
        plan: form.plan,
        price: Number(form.price),
        maxListings: Number(form.maxListings),
        maxDownloads: Number(form.maxDownloads),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        isActive: form.isActive,
        autoRenew: form.autoRenew,
      },
      {
        onSuccess: () => {
          setNotice("Abonnement mis à jour.");
          setEditingId(null);
          setForm(null);
        },
        onError: (error) => setNotice(error instanceof Error ? error.message : "Impossible de mettre à jour l'abonnement."),
      },
    );
  };

  return (
    <AdminLayout title="Abonnements" description="Forfaits professionnels : plan, quotas d'annonces/téléchargements et statut de renouvellement.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {subscriptionsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {subscriptionsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les abonnements.</p>}

      {!subscriptionsQuery.isLoading && !subscriptionsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Professionnel", "Plan", "Prix/mois", "Quotas", "Fin", "Statut", "Renouvellement", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Aucun abonnement.</td></tr>
              )}
              {subscriptions.map((subscription) => {
                const isEditing = editingId === subscription.id;
                return (
                  <tr key={subscription.id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-3 text-white">
                      <p className="font-semibold">{subscription.user.firstName} {subscription.user.lastName}</p>
                      <p className="text-[12px] text-slate-400">{subscription.user.email}</p>
                    </td>
                    {isEditing && form ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={form.plan}
                            onChange={(event) => applyPlanDefaults(event.target.value as AdminSubscription["plan"])}
                            className="h-9 rounded-lg border border-white/20 bg-[#111827] px-2 text-[12px] text-white"
                          >
                            {(Object.keys(planLabel) as AdminSubscription["plan"][]).map((plan) => (
                              <option key={plan} value={plan}>{planLabel[plan]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={form.price}
                            onChange={(event) => setForm((current) => (current ? { ...current, price: event.target.value } : current))}
                            className="h-9 w-24 rounded-lg border border-white/20 bg-[#111827] px-2 text-[12px] text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min={0}
                              value={form.maxListings}
                              onChange={(event) => setForm((current) => (current ? { ...current, maxListings: event.target.value } : current))}
                              placeholder="Annonces"
                              className="h-8 w-28 rounded-lg border border-white/20 bg-[#111827] px-2 text-[12px] text-white"
                            />
                            <input
                              type="number"
                              min={0}
                              value={form.maxDownloads}
                              onChange={(event) => setForm((current) => (current ? { ...current, maxDownloads: event.target.value } : current))}
                              placeholder="Téléchargements"
                              className="h-8 w-28 rounded-lg border border-white/20 bg-[#111827] px-2 text-[12px] text-white"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={form.endDate}
                            onChange={(event) => setForm((current) => (current ? { ...current, endDate: event.target.value } : current))}
                            className="h-9 rounded-lg border border-white/20 bg-[#111827] px-2 text-[12px] text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2 text-[12px] text-slate-200">
                            <input
                              type="checkbox"
                              checked={form.isActive}
                              onChange={(event) => setForm((current) => (current ? { ...current, isActive: event.target.checked } : current))}
                            />
                            Actif
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2 text-[12px] text-slate-200">
                            <input
                              type="checkbox"
                              checked={form.autoRenew}
                              onChange={(event) => setForm((current) => (current ? { ...current, autoRenew: event.target.checked } : current))}
                            />
                            Auto
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={update.isPending}
                              onClick={saveEdit}
                              className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingId(null); setForm(null); }}
                              className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold text-white">{planLabel[subscription.plan]}</td>
                        <td className="px-4 py-3 text-slate-200">{Number(subscription.price).toLocaleString("fr-FR")} FCFA</td>
                        <td className="px-4 py-3 text-slate-200">{subscription.maxListings} annonces · {subscription.maxDownloads} téléch.</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(subscription.endDate).toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${subscription.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}>
                            {subscription.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{subscription.autoRenew ? "Automatique" : "Manuel"}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => startEdit(subscription)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200">
                            Modifier
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
