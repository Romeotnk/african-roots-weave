import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { Switch } from "@/components/ui/switch";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { marketplaceAlerts } from "@/data/marketplaceAlerts";
import type { MarketplaceAlert } from "@/types";

export const Route = createFileRoute("/mon-compte/alertes")({
  head: () => ({ meta: [{ title: "Mes alertes - IWOSAN" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const [alerts, setAlerts] = useState<MarketplaceAlert[]>(marketplaceAlerts);
  const [actionMessage, setActionMessage] = useState("");

  const toggleAlert = (alert: MarketplaceAlert, active: boolean) => {
    setAlerts((current) =>
      current.map((item) =>
        item.id === alert.id ? { ...item, active } : item,
      ),
    );
    setActionMessage(`Alerte ${active ? "activée" : "desactivée"} : ${alert.name}.`);
  };

  const deleteAlert = (alert: MarketplaceAlert) => {
    setAlerts((current) => current.filter((item) => item.id !== alert.id));
    setActionMessage(`Alerte supprimée : ${alert.name}.`);
  };

  const addAlert = () => {
    const nextAlert: MarketplaceAlert = {
      id: `alert-${Date.now()}`,
      name: "Recherche marketplace sauvegardée",
      summary: "Produits vérifiés, prix sous 20 000 FCFA, livraison locale.",
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAlerts((current) => [nextAlert, ...current]);
    setActionMessage("Alerte créée. Ajustez-la depuis vos filtres marketplace.");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <AccountBackLink />
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
                Mon compte
              </p>
              <h1 className="mt-2 text-[32px] md:text-[42px]">Alertes marketplace</h1>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Activez, désactivez ou supprimez vos recherches sauvegardées.
              </p>
            </div>
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
          </div>
        </section>

        <section className="container-iwosan py-8">
          {actionMessage && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
              {actionMessage}
            </p>
          )}

          {alerts.length === 0 ? (
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
        </section>
      </main>
    </ProtectedRoute>
  );
}