import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, MailOpen, Mail } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { useAdminNotifications } from "@/components/admin/AdminNotificationsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clearAdminNotifications,
  getAdminNotifications,
  markAdminNotificationRead,
  type AdminNotification,
} from "@/lib/admin-notifications-api";
import { formatDate } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

const TYPE_LABELS: Record<string, string> = {
  CUSTOMER_REGISTERED: "Nouveau client",
  ORDER_CREATED: "Nouvelle commande",
  ADMIN_LOGIN: "Connexion admin",
  ADMIN_PASSWORD_CHANGED: "Mot de passe admin",
  LOW_STOCK: "Stock faible",
  ORDER_CANCELLED: "Commande annulée",
  PROMOTION_EXPIRING: "Promotion",
};

function AdminNotificationsPage() {
  const { refresh: refreshBadge } = useAdminNotifications();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminNotifications({ page, pageSize });
      setNotifications(response.notifications);
      setUnread(response.unread);
      setTotal(response.pagination.total);
      await refreshBadge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les notifications.");
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [page, pageSize]);

  const toggleRead = async (notification: AdminNotification) => {
    try {
      setError("");
      await markAdminNotificationRead(notification.id, !notification.isRead);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  };

  const markAllRead = async () => {
    try {
      setError("");
      await Promise.all(
        notifications
          .filter((notification) => !notification.isRead)
          .map((notification) => markAdminNotificationRead(notification.id, true)),
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de marquer les notifications.");
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Supprimer toutes les notifications ?")) return;
    try {
      setError("");
      await clearAdminNotifications();
      setPage(1);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  return (
    <>
      <AdminHeader
        title="Notifications"
        subtitle={`${unread} non lue(s)`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-9" onClick={markAllRead} disabled={!unread}>
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </Button>
            <Button size="sm" variant="destructive" className="h-9" onClick={clearAll} disabled={!total}>
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Tout supprimer</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-4 transition ${
                    notification.isRead ? "bg-background" : "bg-primary/5"
                  }`}
                >
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {TYPE_LABELS[notification.type] ?? notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" aria-label="Non lue" />
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{notification.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)} · {new Date(notification.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => toggleRead(notification)}
                    aria-label={notification.isRead ? "Marquer non lue" : "Marquer lue"}
                  >
                    {notification.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </Button>
                </div>
              ))}

              {!loading && notifications.length === 0 && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Aucune notification.
                </div>
              )}
              {loading && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Chargement des notifications…
                </div>
              )}
            </div>
          </CardContent>
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </Card>
      </div>
    </>
  );
}
