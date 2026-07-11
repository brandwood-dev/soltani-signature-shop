import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminNotifications,
  type AdminNotification,
} from "@/lib/admin-notifications-api";

type AdminNotificationsContextValue = {
  unread: number;
  latest: AdminNotification[];
  refresh: () => Promise<void>;
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

const NOTIFICATIONS_QUERY_KEY = ["admin-notifications-summary"];
const POLL_INTERVAL_MS = 30_000;

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const summaryQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getAdminNotifications({ page: 1, pageSize: 5 }),
    staleTime: 10_000,
    refetchInterval: () => (document.visibilityState === "visible" ? POLL_INTERVAL_MS : false),
    refetchOnWindowFocus: true,
  });

  const refresh = async () => {
    await queryClient.fetchQuery({
      queryKey: NOTIFICATIONS_QUERY_KEY,
      queryFn: () => getAdminNotifications({ page: 1, pageSize: 5 }),
      staleTime: 10_000,
    });
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh().catch(() => undefined);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!summaryQuery.data) return;

    const incoming = summaryQuery.data.notifications.filter((notification) => !seenIds.current.has(notification.id));
    summaryQuery.data.notifications.forEach((notification) => seenIds.current.add(notification.id));

    if (initialized.current) {
      incoming
        .filter((notification) => !notification.isRead)
        .reverse()
        .forEach((notification) => {
          toast(notification.title, {
            description: notification.message,
            action: {
              label: "Voir",
              onClick: () => {
                window.location.href = "/admin/notifications";
              },
            },
          });
        });
    }

    initialized.current = true;
  }, [summaryQuery.data]);

  const value = useMemo(
    () => ({
      unread: summaryQuery.data?.unread ?? 0,
      latest: summaryQuery.data?.notifications ?? [],
      refresh,
    }),
    [summaryQuery.data?.notifications, summaryQuery.data?.unread],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationsContext) ?? { unread: 0, latest: [], refresh: async () => undefined };
}
