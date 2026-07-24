import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTicketActions, useAdminTickets } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/communication/tickets")({
  head: () => ({ meta: [{ title: "Admin tickets - IWOSAN" }] }),
  component: AdminTicketsPage,
});

type TicketMessage = { id: string; content: string; authorId: string; createdAt: string };
type Ticket = { id: string; subject: string; category: string; status: string; createdAt: string; messages: TicketMessage[] };

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function AdminTicketsPage() {
  const ticketsQuery = useAdminTickets();
  const { updateStatus, reply } = useAdminTicketActions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const tickets = (ticketsQuery.data?.data ?? []) as Ticket[];
  const active = tickets.find((ticket) => ticket.id === activeId) ?? tickets[0] ?? null;

  return (
    <AdminLayout title="Tickets support" description="Liste, statut et réponses aux demandes utilisateurs.">
      {ticketsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {ticketsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les tickets.</p>}

      {!ticketsQuery.isLoading && !ticketsQuery.isError && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <AdminCard className="p-0">
            <div className="max-h-[560px] overflow-y-auto">
              {tickets.length === 0 && <p className="p-5 text-[13px] text-slate-400">Aucun ticket pour le moment.</p>}
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setActiveId(ticket.id)}
                  className={`block w-full border-b border-white/10 p-4 text-left ${active?.id === ticket.id ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{ticket.subject}</p>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-slate-300">{ticket.status}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-slate-500">{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</p>
                </button>
              ))}
            </div>
          </AdminCard>

          {active ? (
            <AdminCard>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold text-white">{active.subject}</h2>
                <select
                  value={active.status}
                  onChange={(event) => updateStatus.mutate({ id: active.id, status: event.target.value })}
                  disabled={updateStatus.isPending}
                  className="h-10 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
                {active.messages.length === 0 && <p className="text-[13px] text-slate-500">Aucun message échangé.</p>}
                {active.messages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-white/5 p-3 text-[13px] text-slate-200">
                    <p>{message.content}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{new Date(message.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Écrire une réponse..."
                  className="min-h-20 flex-1 rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
                />
                <button
                  type="button"
                  disabled={reply.isPending || draft.trim().length === 0}
                  onClick={() => reply.mutate({ id: active.id, content: draft.trim() }, { onSuccess: () => setDraft("") })}
                  className="rounded-lg bg-emerald-400 px-4 text-[13px] font-bold text-[#111827] disabled:opacity-50"
                >
                  Répondre
                </button>
              </div>
            </AdminCard>
          ) : (
            <AdminCard><p className="text-[13px] text-slate-400">Sélectionnez un ticket pour voir la conversation.</p></AdminCard>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
