import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { apiRequest } from "@/lib/api/client";

type Action = {
  label: string;
  to: string;
};

export type ClientSectionConfig = {
  title: string;
  eyebrow: string;
  description: string;
  endpoint?: string;
  icon: LucideIcon;
  action?: Action;
  emptyLabel: string;
  renderItem?: (item: Record<string, unknown>) => ReactNode;
};

type ApiListPayload = Record<string, unknown>[] | Record<string, unknown> | null;

const asList = (payload: ApiListPayload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value as Record<string, unknown>[];
  }
  return [payload];
};

const text = (value: unknown, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const money = (value: unknown) => {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString("fr-FR")} FCFA`;
};

export const defaultRenderItem = (item: Record<string, unknown>) => {
  const product = item.product as Record<string, unknown> | undefined;
  const author = item.author as Record<string, unknown> | undefined;
  const title = text(item.title ?? item.subject ?? product?.title ?? item.code ?? item.reference ?? item.type, "Element");
  const status = text(item.status ?? item.kycStatus ?? item.isPublished ?? item.isActive);
  const subtitle = text(
    item.description ?? item.content ?? item.category ?? author?.firstName ?? item.message ?? item.link,
    "Aucune description disponible",
  );
  const amount = item.totalAmount ?? item.amount ?? item.price ?? item.discount;

  return (
    <div className="flex flex-col gap-3 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-[var(--color-text-primary)]">{title}</p>
        <p className="mt-1 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {amount !== undefined && (
          <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
            {money(amount)}
          </span>
        )}
        <span className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-secondary)]">
          {status}
        </span>
      </div>
    </div>
  );
};

export function ClientSectionPage({ config }: { config: ClientSectionConfig }) {
  const Icon = config.icon;
  const query = useQuery({
    queryKey: ["client-section", config.endpoint],
    queryFn: async () => {
      if (!config.endpoint) return [];
      const response = await apiRequest<ApiListPayload>(config.endpoint);
      return asList(response.data);
    },
    enabled: Boolean(config.endpoint),
    retry: false,
  });

  const items = query.data ?? [];
  const renderItem = config.renderItem ?? defaultRenderItem;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{config.eyebrow}</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">{config.title}</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">{config.description}</p>
              </div>
              {config.action && (
                <Link
                  to={config.action.to as never}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white"
                >
                  <Plus size={17} /> {config.action.label}
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <Icon size={22} className="text-[var(--brand-primary)]" />
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Total</p>
              <p className="mt-1 text-[28px] font-extrabold">{items.length}</p>
            </div>
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <ExternalLink size={22} className="text-[var(--brand-primary)]" />
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Source</p>
              <p className="mt-1 text-[14px] font-semibold">{config.endpoint ? "API IWOSAN" : "Page locale"}</p>
            </div>
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Statut</p>
              <p className="mt-2 text-[14px] font-semibold">
                {query.isLoading ? "Chargement" : query.isError ? "Erreur API" : "Operationnel"}
              </p>
            </div>
          </div>

          {query.isLoading ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-[14px] text-[var(--color-text-muted)]">
              Chargement des donnees...
            </div>
          ) : query.isError ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-5 text-[14px] text-red-700">
              Impossible de charger cette section. Verifiez votre connexion ou reconnectez-vous.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
              <Icon className="mx-auto text-[var(--brand-primary)]" size={34} />
              <h2 className="mt-4 text-[20px] font-bold">{config.emptyLabel}</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Cette page est connectee au backend et affichera vos donnees des qu'elles existent.
              </p>
            </div>
          ) : (
            <div className="space-y-3">{items.map((item, index) => <div key={text(item.id, String(index))}>{renderItem(item)}</div>)}</div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}