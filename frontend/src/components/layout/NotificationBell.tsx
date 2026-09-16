import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationService";
import type { AppNotification } from "../../types/notification";
import { formatRelativeTime } from "../../utils/formatters";

// How often to check for new notifications while the tab is visible. There is
// no push channel, so this is the latency ceiling; a minute is plenty for
// grades and announcements.
const POLL_INTERVAL_MS = 60_000;

export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const feed = await getNotifications();
      setItems(feed.notifications);
      setUnreadCount(feed.unreadCount);
    } catch {
      // A failed poll is silent: the bell keeps its last known state and the
      // next poll tries again. Surfacing a toast every minute would be worse.
    } finally {
      setLoaded(true);
    }
  }, []);

  // Refresh on every navigation, and on a timer while the tab is visible.
  useEffect(() => {
    void refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [refresh]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleSelect(item: AppNotification) {
    setOpen(false);

    if (!item.readAt) {
      // Optimistic: the badge updates immediately, and a failed request just
      // means the item shows as unread again on the next refresh.
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
      void markNotificationRead(item.id).catch(() => undefined);
    }

    if (item.link) {
      navigate(item.link);
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      void refresh();
    }
  }

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold text-brand-fg ring-2 ring-white dark:ring-gray-900">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Notifications</h2>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAll()}
                className="text-xs font-medium text-brand-ink hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {!loaded ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                You're all caught up
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                New grades, assignments and updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void handleSelect(item)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                      item.readAt ? "" : "bg-brand-soft"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.readAt ? "bg-transparent" : "bg-brand-ink"
                      }`}
                      aria-hidden="true"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-800 dark:text-gray-200">
                        {item.title}
                      </span>

                      {item.body && (
                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                          {item.body}
                        </span>
                      )}

                      <span className="mt-1 block font-mono text-[11px] text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(item.createdAt)}
                        {!item.readAt && <span className="sr-only"> (unread)</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
