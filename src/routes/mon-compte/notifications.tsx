import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCircle2, MessageSquare, PackageCheck, Star, Store, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import type { NotificationType } from "@/data/notifications";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useNotificationsApi";

export const Route = createFileRoute("/mon-compte/notifications")({
  head: () => ({ meta: [{ title: "Notifications - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "professional", "admin", "super_admin"]}>
      <NotificationsPage />
    </ProtectedRoute>
  ),
});

const icons: Record<NotificationType, typeof Bell> = {
  message: MessageSquare,
  listing: Store,
  order: PackageCheck,
  review: Star,
  forum: Users,
};

const filterLabels: Record<"all" | NotificationType, string> = {
  all: "Toutes",
  message: "Messages",
  listing: "Annonces",
  order: "Commandes",
  review: "Avis",
  forum: "Forum",
};

function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [actionMessage, setActionMessage] = useState("");
  const { data: items = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const filtered = useMemo(() => items.filter((item) => filter === "all" || item.type === filter), [filter, items]);
  const unreadCount = items.filter((item) => !item.read).length;

  const updateReadState = (id: string, read: boolean) => {
    markRead.mutate(
      { id, read },
      {
        onSuccess: () => setActionMessage(read ? "Notification marquee comme lue." : "Notification marquee comme non lue."),
        onError: (error) => setActionMessage(error instanceof Error ? error.message : "Action impossible."),
      },
    );
  };

  const markAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => setActionMessage("Toutes les notifications sont marquees comme lues."),
      onError: (error) => setActionMessage(error instanceof Error ? error.message : "Action impossible."),
    });
  };

  return (
    <AccountLayout
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}.` : "Aucune notification non lue."}
      actions={
        <button
          type="button"
          onClick={markAllRead}
          disabled={items.length === 0 || unreadCount === 0 || markAllReadMutation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={15} /> Tout marquer lu
        </button>
      }
    >
      <div className="max-w-4xl">
        <div className="flex flex-wrap gap-2">
          {(["all", "message", "listing", "order", "review", "forum"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-10 rounded-full border px-4 text-[13px] font-semibold ${filter === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] bg-white"}`}
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>

        {actionMessage && (
          <p className="mt-5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <Bell className="mx-auto text-[var(--brand-primary)]" size={26} />
              <h2 className="mt-3 text-[20px] font-bold">Aucune notification</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                Les alertes liees aux messages, commandes et annonces apparaitront ici.
              </p>
            </div>
          )}

          {filtered.map((item) => {
            const Icon = icons[item.type];
            return (
              <div key={item.id} className={`rounded-[12px] border bg-white p-4 shadow-iwosan-sm ${item.read ? "border-[var(--brand-border-light)]" : "border-[var(--brand-primary)]"}`}>
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={item.href as never} className="font-bold hover:text-[var(--brand-primary)]">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">{item.body}</p>
                    <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{item.date}</p>
                  </div>
                  {!item.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand-primary)]" aria-label="Non lue" />}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => updateReadState(item.id, !item.read)}
                    disabled={markRead.isPending && markRead.variables?.id === item.id}
                    className="rounded-full border border-[var(--brand-border)] px-3 py-1 text-[12px] font-semibold disabled:opacity-50"
                  >
                    {item.read ? "Marquer non lue" : "Marquer lue"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AccountLayout>
  );
}