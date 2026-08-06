import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Loader2, Plus, Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Switch } from "@/components/ui/switch";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMySavedSearches, useSavedSearchActions } from "@/hooks/useSavedSearchesApi";
import type { MarketplaceAlert } from "@/types";

export const Route = createFileRoute("/mon-compte/alertes")({
  head: () => ({ meta: [{ title: "Mes alertes - IWOSAN" }] }),
  component: AlertsPage,
});

type BackendSavedSearch = {
  id?: string;
  name?: string;
  summary?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

function toMarketplaceAlert(search: BackendSavedSearch): MarketplaceAlert | null {
  if (!search.id || !search.name) return null;
  return {
    id: search.id,
    name: search.name,
    summary: search.summary ?? "Recherche marketplace sauvegardée.",
    active: search.isActive ?? true,
    createdAt: search.createdAt ? search.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

function AlertsPage() {
  const savedSearchesQuery = useMySavedSearches();
  const { create, update, remove } = useSavedSearchActions();
  const [actionMessage, setActionMessage] = useState("");

  const alerts = useMemo(
    () => ((savedSearchesQuery.data ?? []) as BackendSavedSearch[]).map(toMarketplaceAlert).filter((item): item is MarketplaceAlert => Boolean(item)),
    [savedSearchesQuery.data],
  );

  const toggleAlert = (alert: MarketplaceAlert, active: boolean) => {
    update.mutate(
      { id: alert.id, isActive: active },
      { onSuccess: () => setActionMessage(`Alerte ${active ? "activée" : "desactivée"} : ${alert.name}.`) },
    );
  };

  const deleteAlert = (alert: MarketplaceAlert) => {
    remove.mutate(alert.id, { onSuccess: () => setActionMessage(`Alerte supprimée : ${alert.name}.`) });
  };

  const addAlert = () => {
    create.mutate(
      { name: "Recherche marketplace sauvegardée", summary: "Produits vérifiés, prix sous 20 000 FCFA, livraison locale." },
      { onSuccess: () => setActionMessage("Alerte créée. Ajustez-la depuis vos filtres marketplace.") },
    );
  };

  return (
    <ProtectedRoute>
      <AccountLayout
        title="Alertes marketplace"
        description="Activez, désactivez ou supprimez vos recherches sauvegardées."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addAlert}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] px-5 text-[14px] font-semibold"
            >
              <Plus size={16} /> Créer une alerte
            </button>
            <Link
              to="/marketplace"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white"
            >
              Créer depuis la marketplace
            </Link>
          </div>
        }
      >
          {actionMessage && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
              {actionMessage}
            </p>
          )}

          {savedSearchesQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-[16px] border border-[var(--brand-border-light)] bg-white p-10">
              <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
            </div>
          ) : savedSearchesQuery.isError ? (
            <div className="rounded-[16px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
              Impossible de charger vos alertes pour le moment.
            </div>
          ) : alerts.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
              <Bell className="mx-auto text-[var(--brand-primary)]" size={42} />
              <h2 className="mt-4 text-[24px] font-bold">Aucune alerte active</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Créez une alerte depuis vos filtres marketplace pour recevoir les nouveaux résultats.
              </p>
              <Link to="/marketplace" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
                Aller à la marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <article
                  key={alert.id}
                  className="flex flex-col gap-4 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:flex-row md:items-center"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Bell size={19} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{alert.name}</h2>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${alert.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {alert.active ? "ACTIVE" : "PAUSE"}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{alert.summary}</p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Créée le {alert.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={alert.active} onCheckedChange={(checked) => toggleAlert(alert, Boolean(checked))} />
                    <button
                      type="button"
                      onClick={() => deleteAlert(alert)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] text-red-600"
                      aria-label="Supprimer l'alerte"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
      </AccountLayout>
    </ProtectedRoute>
  );
}