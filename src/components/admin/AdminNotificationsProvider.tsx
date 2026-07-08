import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<AdminNotification[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const refresh = async () => {
    const response = await getAdminNotifications({ page: 1, pageSize: 5 });
    setUnread(response.unread);
    setLatest(response.notifications);

    const incoming = response.notifications.filter((notification) => !seenIds.current.has(notification.id));
    response.notifications.forEach((notification) => seenIds.current.add(notification.id));

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
  };

  useEffect(() => {
    refresh().catch(() => undefined);
    const interval = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 10_000);

    return () => window.clearInterval(interval);
  }, []);

  const value = useMemo(() => ({ unread, latest, refresh }), [unread, latest]);

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationsContext) ?? { unread: 0, latest: [], refresh: async () => undefined };
}
