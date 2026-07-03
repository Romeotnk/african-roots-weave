import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageSquare, PackageCheck, Star } from "lucide-react";
import { useState } from "react";
import { orders } from "@/data/orders";
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/mes-commandes")({
  head: () => ({ meta: [{ title: "Mes commandes - IWOSAN" }] }),
  component: OrdersPage,
});

const timeline: { id: OrderStatus; label: string }[] = [
  { id: "confirmed", label: "Confirmee" },
  { id: "paid", label: "Payee" },
  { id: "preparing", label: "Preparation" },
  { id: "shipped", label: "Expediee" },
  { id: "delivered", label: "Livree" },
  { id: "completed", label: "Terminee" },
];

function OrdersPage() {
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const [buyerRatings, setBuyerRatings] = useState<Record<string, { rating: number; comment: string }>>({});
  const filtered = orders.filter((order) => order.role === tab);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <h1 className="text-[32px] md:text-[42px]">Mes commandes</h1>
          <div className="mt-5 inline-flex rounded-full border border-[var(--brand-border)] bg-white p-1">
            {[
              ["buyer", "Acheteur"],
              ["seller", "Vendeur"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as "buyer" | "seller")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === value ? "bg-[var(--brand-primary)] text-white" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8 space-y-4">
        {filtered.map((order) => {
          const statusIndex = timeline.findIndex((step) => step.id === order.status);
          return (
            <article key={order.id} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold">{order.id}</h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {order.date} - {order.total.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-bold text-[var(--brand-primary)]">
                  {timeline[statusIndex]?.label ?? order.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
                {timeline.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index <= statusIndex ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-muted)]"}`}>
                      <CheckCircle2 size={15} />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold">{step.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {order.items.map((item) => (
                  <div key={item.title} className="flex justify-between rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                    <span>{item.quantity} x {item.title}</span>
                    <strong>{item.price.toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/mes-commandes/$id/litige"
                  params={{ id: order.id }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
                >
                  <MessageSquare size={15} /> Signaler un probleme
                </Link>
                <button className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                  <PackageCheck size={15} /> Confirmer la reception
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                  <Star size={15} /> Laisser un avis
                </button>
              </div>

              {tab === "seller" && ["delivered", "completed"].includes(order.status) && (
                <div className="mt-5 rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Noter l'acheteur</h3>
                      <p className="text-[13px] text-[var(--color-text-muted)]">
                        Score de fiabilite visible sur son profil vendeur.
                      </p>
                    </div>
                    {buyerRatings[order.id] && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                        Note envoyee : {buyerRatings[order.id].rating}/5
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBuyerRatings((current) => ({ ...current, [order.id]: { rating: value, comment: current[order.id]?.comment ?? "" } }))}
                        className={`grid h-10 w-10 place-items-center rounded-full border ${buyerRatings[order.id]?.rating >= value ? "border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--brand-primary-dark)]" : "border-[var(--brand-border)] bg-white"}`}
                        aria-label={`${value} etoiles`}
                      >
                        <Star size={16} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={buyerRatings[order.id]?.comment ?? ""}
                    onChange={(event) => setBuyerRatings((current) => ({ ...current, [order.id]: { rating: current[order.id]?.rating ?? 5, comment: event.target.value } }))}
                    placeholder="Commentaire optionnel"
                    className="mt-3 min-h-20 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-[13px]"
                  />
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
