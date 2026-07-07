import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MessageSquare, PackageCheck, Star, Store, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import type { NotificationType } from "@/data/notifications";
import { useNotifications } from "@/hooks/useNotificationsApi";

export const Route = createFileRoute("/mon-compte/notifications")({
  head: () => ({ meta: [{ title: "Notifications - IWOSAN" }] }),
  component: NotificationsPage,
});

const icons: Record<NotificationType, typeof Bell> = {
  message: MessageSquare,
  listing: Store,
  order: PackageCheck,
  review: Star,
  forum: Users,
};

function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const { data: notifications = [] } = useNotifications();
  const filtered = useMemo(() => notifications.filter((item) => filter === "all" || item.type === filter), [filter, notifications]);

  return (
    <main className="bg-[var(--brand-bg)] py-10">
      <div className="container-iwosan max-w-4xl">
        <AccountBackLink />
        <h1 className="text-[34px]">Notifications</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {["all", "message", "listing", "order", "review", "forum"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item as typeof filter)}
              className={`h-10 rounded-full border px-4 text-[13px] font-semibold ${filter === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)] bg-white"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {filtered.map((item) => {
            const Icon = icons[item.type];
            return (
              <Link key={item.id} to={item.href as any} className="flex gap-4 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-4 shadow-iwosan-sm">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="font-bold">{item.title}</span>
                  <span className="mt-1 block text-[14px] text-[var(--color-text-secondary)]">{item.body}</span>
                  <span className="mt-2 block text-[12px] text-[var(--color-text-muted)]">{item.date}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
