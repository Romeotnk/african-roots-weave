import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useStaffTicketActions, useStaffTickets } from "@/hooks/useTicketsApi";

export const Route = createFileRoute("/tableau-de-bord/support")({
  head: () => ({ meta: [{ title: "Support - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <SupportPage />
    </ProtectedRoute>
  ),
});

type TicketMessage = { id: string; content: string; authorId: string; createdAt: string };
type StaffTicket = { id: string; subject: string; category: string; status: string; createdAt: string; messages: TicketMessage[] };

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

function SupportPage() {
  const { t } = useTranslation();
  const statusLabels: Record<string, string> = {
    OPEN: t("dashboard.support.statusOpen"),
    IN_PROGRESS: t("dashboard.support.statusInProgress"),
    RESOLVED: t("dashboard.support.statusResolved"),
    CLOSED: t("dashboard.support.statusClosed"),
  };
  const ticketsQuery = useStaffTickets();
  const { updateStatus, reply } = useStaffTicketActions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof statuses)[number]>("all");

  const tickets = (ticketsQuery.data?.data ?? []) as StaffTicket[];
  const filtered = statusFilter === "all" ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);
  const active = filtered.find((ticket) => ticket.id === activeId) ?? filtered[0] ?? null;

  return (
    <AccountLayout
      title={t("dashboard.support.title")}
      description={t("dashboard.support.description")}
    >
        {ticketsQuery.isLoading && <p className="text-[13px] text-[var(--color-text-muted)]">{t("dashboard.support.loading")}</p>}
        {ticketsQuery.isError && (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{t("dashboard.support.loadError")}</p>
        )}

        {!ticketsQuery.isLoading && !ticketsQuery.isError && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["all", ...statuses] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`h-9 rounded-full px-4 text-[13px] font-semibold transition ${
                    statusFilter === status
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {status === "all" ? t("dashboard.support.all") : statusLabels[status]}
                </button>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
              <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white">
                <div className="max-h-[560px] overflow-y-auto">
                  {filtered.length === 0 && <p className="p-5 text-[13px] text-[var(--color-text-muted)]">{t("dashboard.support.emptyQueue")}</p>}
                  {filtered.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setActiveId(ticket.id)}
                      className={`block w-full border-b border-[var(--brand-border-light)] p-4 text-left ${
                        active?.id === ticket.id ? "bg-[var(--brand-surface-alt)]" : "hover:bg-[var(--brand-surface-alt)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[var(--color-text-primary)]">{ticket.subject}</p>
                        <span className="rounded-full bg-[var(--brand-surface-alt)] px-2 py-1 text-[11px] font-bold text-[var(--color-text-secondary)]">
                          {statusLabels[ticket.status] ?? ticket.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                        {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {active ? (
                <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">{active.subject}</h2>
                    <select
                      value={active.status}
                      onChange={(event) => updateStatus.mutate({ id: active.id, status: event.target.value })}
                      disabled={updateStatus.isPending}
                      className="h-10 rounded-lg border border-[var(--brand-border-light)] bg-white px-3 text-[13px]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
                    {active.messages.length === 0 && <p className="text-[13px] text-[var(--color-text-muted)]">{t("dashboard.support.noMessages")}</p>}
                    {active.messages.map((message) => (
                      <div key={message.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px] text-[var(--color-text-secondary)]">
                        <p>{message.content}</p>
                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{new Date(message.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={t("dashboard.support.replyPlaceholder")}
                      className="min-h-20 flex-1 rounded-lg border border-[var(--brand-border-light)] px-3 py-2 text-[13px] outline-none focus:border-[var(--brand-primary)]"
                    />
                    <button
                      type="button"
                      disabled={reply.isPending || draft.trim().length === 0}
                      onClick={() => reply.mutate({ id: active.id, content: draft.trim() }, { onSuccess: () => setDraft("") })}
                      className="btn-primary h-auto px-4 text-[13px] disabled:opacity-50"
                    >
                      <Send size={16} /> {t("dashboard.support.reply")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
                  <LifeBuoy className="mx-auto text-[var(--brand-primary)]" size={34} />
                  <p className="mt-3 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.support.selectTicket")}</p>
                </div>
              )}
            </div>
          </>
        )}
    </AccountLayout>
  );
}
