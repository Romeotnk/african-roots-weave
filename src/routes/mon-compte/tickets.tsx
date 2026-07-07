import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { supportTickets } from "@/data/help";
import type { SupportTicketStatus } from "@/types";

export const Route = createFileRoute("/mon-compte/tickets")({
  head: () => ({ meta: [{ title: "Mes tickets - IWOSAN" }] }),
  component: TicketsPage,
});

const statusLabels: Record<SupportTicketStatus, string> = {
  open: "Ouvert",
  pending: "En cours",
  resolved: "Resolu",
};

function TicketsPage() {
  const [activeId, setActiveId] = useState(supportTickets[0]?.id);
  const active = supportTickets.find((ticket) => ticket.id === activeId) ?? supportTickets[0];

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="container-iwosan py-10">
        <AccountBackLink />
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Support</p>
        <h1 className="mt-2 text-[34px] md:text-[44px]">Mes tickets</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-3">
            {supportTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setActiveId(ticket.id)}
                className={`w-full rounded-[12px] border p-4 text-left ${
                  activeId === ticket.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border-light)] bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{ticket.subject}</p>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold">{statusLabels[ticket.status]}</span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{ticket.id} · {ticket.category} · {ticket.createdAt}</p>
              </button>
            ))}
          </aside>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[22px] font-bold"><MessageCircle size={20} /> {active.subject}</h2>
            <div className="mt-5 space-y-3">
              {active.messages.map((message) => (
                <div key={message.id} className={`flex ${message.author === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-[14px] p-4 text-[14px] ${message.author === "me" ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}>
                    <p>{message.content}</p>
                    <p className="mt-2 text-[11px] opacity-70">{message.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <input placeholder="Repondre au support..." className="h-11 min-w-0 flex-1 rounded-full border border-[var(--brand-border)] px-4" />
              <button className="h-11 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white">Envoyer</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
