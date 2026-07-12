import { apiFetch } from "@/lib/api";

export type AdminNotificationType =
  | "CUSTOMER_REGISTERED"
  | "ORDER_CREATED"
  | "ADMIN_LOGIN"
  | "ADMIN_PASSWORD_CHANGED"
  | "LOW_STOCK"
  | "ORDER_CANCELLED"
  | "PROMOTION_EXPIRING";

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotificationsResponse = {
  notifications: AdminNotification[];
  unread: number;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type AdminNotificationsSummaryResponse = {
  notifications: AdminNotification[];
  unread: number;
};

export function getAdminNotifications(query: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.unreadOnly) params.set("unreadOnly", "true");

  return apiFetch<AdminNotificationsResponse>(`/admin/notifications?${params.toString()}`);
}

export function getAdminNotificationsSummary() {
  return apiFetch<AdminNotificationsSummaryResponse>("/admin/notifications/summary");
}

export async function markAdminNotificationRead(id: string, isRead: boolean) {
  const response = await apiFetch<{ notification: AdminNotification }>(`/admin/notifications/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
  return response.notification;
}

export function clearAdminNotifications() {
  return apiFetch<{ deleted: boolean }>("/admin/notifications", { method: "DELETE" });
}

export function createAdminLoginNotification() {
  return apiFetch<AdminNotification>("/admin/notifications/admin-login", { method: "POST" });
}
