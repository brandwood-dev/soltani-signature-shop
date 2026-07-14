import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminNotificationsSummary,
  type AdminNotification,
} from "@/lib/admin-notifications-api";

type AdminNotificationsContextValue = {
  unread: number;
  latest: AdminNotification[];
  refresh: () => Promise<void>;
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

const NOTIFICATIONS_QUERY_KEY = ["admin-notifications-summary"];
const POLL_INTERVAL_MS = 300_000;
const INITIAL_LOAD_DELAY_MS = 1_200;

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const [isVisible, setIsVisible] = useState(() => (
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  ));

  const summaryQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getAdminNotificationsSummary,
    enabled: ready && isVisible,
    staleTime: 60_000,
    refetchInterval: ready && isVisible ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const refresh = async () => {
    await queryClient.fetchQuery({
      queryKey: NOTIFICATIONS_QUERY_KEY,
      queryFn: getAdminNotificationsSummary,
      staleTime: 0,
    });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setReady(true), INITIAL_LOAD_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
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
      const unreadIncoming = incoming.filter((notification) => !notification.isRead).reverse();
      if (unreadIncoming.length > 0) {
        void import("sonner").then(({ toast }) => {
          unreadIncoming.forEach((notification) => {
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
        });
      }
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
