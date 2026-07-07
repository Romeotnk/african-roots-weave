import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { Switch } from "@/components/ui/switch";
import { marketplaceAlerts } from "@/data/marketplaceAlerts";
import type { MarketplaceAlert } from "@/types";

export const Route = createFileRoute("/mon-compte/alertes")({
  head: () => ({ meta: [{ title: "Mes alertes - IWOSAN" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const [alerts, setAlerts] = useState<MarketplaceAlert[]>(marketplaceAlerts);

  return (
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
              Activez, desactivez ou supprimez vos recherches sauvegardees.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white"
          >
            Creer depuis la marketplace
          </Link>
        </div>
      </section>

      <section className="container-iwosan py-8">
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
                <h2 className="font-bold">{alert.name}</h2>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{alert.summary}</p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Creee le {alert.createdAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={alert.active}
                  onCheckedChange={(checked) =>
                    setAlerts((current) =>
                      current.map((item) =>
                        item.id === alert.id ? { ...item, active: Boolean(checked) } : item,
                      ),
                    )
                  }
                />
                <button
                  onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] text-red-600"
                  aria-label="Supprimer l'alerte"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
