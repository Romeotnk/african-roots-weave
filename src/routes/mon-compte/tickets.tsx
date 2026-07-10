import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { supportTickets } from "@/data/help";
import type { SupportTicketStatus } from "@/types";

export const Route = createFileRoute("/mon-compte/tickets")({
  head: () => ({ meta: [{ title: "Mes tickets - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "researcher", "professional", "admin", "super_admin"]}>
      <TicketsPage />
    </ProtectedRoute>
  ),
});

const statusLabels: Record<SupportTicketStatus, string> = {
  open: "Ouvert",
  pending: "En cours",
  resolved: "Resolu",
};

const statusClasses: Record<SupportTicketStatus, string> = {
  open: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

function TicketsPage() {
  const [tickets, setTickets] = useState(supportTickets);
  const [activeId, setActiveId] = useState(supportTickets[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [actionMessage, setActionMessage] = useState("");

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);
  const active = filteredTickets.find((ticket) => ticket.id === activeId) ?? filteredTickets[0];

  const sendReply = () => {
    if (!active) {
      setActionMessage("Selectionnez un ticket avant de repondre.");
      return;
    }

    const content = draft.trim();
    if (content.length < 3) {
      setActionMessage("Votre reponse doit contenir au moins 3 caracteres.");
      return;
    }

    const createdAt = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === active.id
          ? {
              ...ticket,
              status: "pending",
              messages: [
                ...ticket.messages,
                {
                  id: `local-${Date.now()}`,
                  author: "me" as const,
                  content,
                  createdAt,
                },
              ],
            }
          : ticket,
      ),
    );
    setDraft("");
    setActionMessage("Reponse envoyee au support. Le ticket repasse en cours de traitement.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="container-iwosan py-10">
        <AccountBackLink />
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Support</p>
        <h1 className="mt-2 text-[34px] md:text-[44px]">Mes tickets</h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="text-[13px] font-semibold text-[var(--color-text-muted)]" htmlFor="ticket-status-filter">
            Filtrer
          </label>
          <select
            id="ticket-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as SupportTicketStatus | "all");
              setActionMessage("");
            }}
            className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"
          >
            <option value="all">Tous les tickets</option>
            <option value="open">Ouverts</option>
            <option value="pending">En cours</option>
            <option value="resolved">Resolus</option>
          </select>
        </div>

        {actionMessage && (
          <p className="mt-5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-3">
            {filteredTickets.length === 0 && (
              <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-5 text-[13px] text-[var(--color-text-muted)]">
                Aucun ticket ne correspond a ce filtre.
              </div>
            )}

            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => {
                  setActiveId(ticket.id);
                  setActionMessage("");
                }}
                className={`w-full rounded-[12px] border p-4 text-left ${
                  active?.id === ticket.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border-light)] bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{ticket.subject}</p>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                  {ticket.id} - {ticket.category} - {ticket.createdAt}
                </p>
              </button>
            ))}
          </aside>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            {!active ? (
              <div className="grid min-h-[280px] place-items-center text-center">
                <div>
                  <MessageCircle className="mx-auto text-[var(--brand-primary)]" size={28} />
                  <h2 className="mt-3 text-[20px] font-bold">Aucun ticket selectionne</h2>
                  <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                    Changez le filtre ou creez un ticket depuis le centre d'aide.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[22px] font-bold">
                    <MessageCircle size={20} /> {active.subject}
                  </h2>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${statusClasses[active.status]}`}>
                    {statusLabels[active.status]}
                  </span>
                </div>

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

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendReply();
                    }}
                    placeholder="Repondre au support..."
                    className="h-11 min-w-0 flex-1 rounded-full border border-[var(--brand-border)] px-4"
                  />
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={draft.trim().length < 3}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[var(--brand-surface-alt)] disabled:text-[var(--color-text-muted)]"
                  >
                    <Send size={15} /> Envoyer
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}