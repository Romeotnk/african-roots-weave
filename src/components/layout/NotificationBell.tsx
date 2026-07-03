import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, MessageSquare, PackageCheck, Star, Store, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NotificationType } from "@/data/notifications";
import { notificationKeys, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useNotificationsApi";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { toNotification } from "@/lib/api/notifications";

const icons: Record<NotificationType, typeof Bell> = {
  message: MessageSquare,
  listing: Store,
  order: PackageCheck,
  review: Star,
  forum: Users,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [readIds, setReadIds] = useState(() => new Set<string>());
  useEffect(() => {
    setReadIds(new Set(notifications.filter((item) => item.read).map((item) => item.id)));
  }, [notifications]);
  useNotificationsSocket({
    onNotificationNew: useCallback(
      (notification) => {
        queryClient.setQueryData(notificationKeys.all, (current = []) => [toNotification(notification), ...current]);
      },
      [queryClient],
    ),
  });
  const unreadCount = useMemo(() => notifications.filter((item) => !readIds.has(item.id)).length, [notifications, readIds]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-border)] text-[var(--color-text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[320px] rounded-[12px] border border-[var(--brand-border-light)] bg-[var(--color-surface)] p-3 shadow-iwosan-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <strong className="text-[14px]">Notifications</strong>
            <button
              type="button"
              onClick={() => {
                setReadIds(new Set(notifications.map((item) => item.id)));
                markAllRead.mutate();
              }}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-primary)]"
            >
              <CheckCheck size={14} /> Tout lire
            </button>
          </div>
          <div className="max-h-[340px] space-y-2 overflow-y-auto">
            {notifications.slice(0, 4).map((item) => {
              const Icon = icons[item.type];
              const unread = !readIds.has(item.id);
              return (
                <Link
                  key={item.id}
                  to={item.href as any}
                  onClick={() => {
                    setReadIds((value) => new Set(value).add(item.id));
                    markRead.mutate(item.id);
                    setOpen(false);
                  }}
                  className="flex gap-3 rounded-lg p-3 text-left hover:bg-[var(--brand-primary-subtle)]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] font-bold">
                      {item.title}
                      {unread && <span className="h-2 w-2 rounded-full bg-red-500" />}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[12px] text-[var(--color-text-muted)]">{item.body}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <Link to="/mon-compte/notifications" onClick={() => setOpen(false)} className="mt-2 flex h-9 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[12px] font-bold text-white">
            Voir tout l'historique
          </Link>
        </div>
      )}
    </div>
  );
}
