import { apiDownload, apiFetch } from "@/lib/api";

export type AdminOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type AdminPaymentMethod = "card" | "cod";

export type AdminOrderListItem = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  total: number;
  items: number;
  status: AdminOrderStatus;
  paymentMethod: AdminPaymentMethod;
  createdAt: string;
};

export type AdminOrderDetails = AdminOrderListItem & {
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  updatedAt: string;
  phone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    governorate: string;
    postalCode: string;
  };
  lineItems: Array<{
    id: string;
    name: string;
    brand: string;
    sku: string;
    image: string;
    qty: number;
    price: number;
    total: number;
  }>;
};

export type AdminOrdersResponse = {
  orders: AdminOrderListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  statusCounts: Record<"all" | AdminOrderStatus, number>;
};

export type AdminOrdersQuery = {
  query?: string;
  status?: "all" | AdminOrderStatus;
  payment?: "all" | AdminPaymentMethod;
  page?: number;
  pageSize?: number;
};

export type AdminOrderExportPeriod =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "this_week"
  | "this_month"
  | "this_year"
  | "all";

export type AdminOrdersExportQuery = {
  period: AdminOrderExportPeriod;
  status: "all" | AdminOrderStatus;
};

export function getAdminOrders(query: AdminOrdersQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set("query", query.query);
  if (query.status) params.set("status", query.status);
  if (query.payment) params.set("payment", query.payment);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  return apiFetch<AdminOrdersResponse>(`/orders/admin?${params.toString()}`);
}

export async function getAdminOrder(id: string) {
  const response = await apiFetch<{ order: AdminOrderDetails }>(`/orders/admin/${id}`);
  return response.order;
}

export async function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  const response = await apiFetch<{ order: AdminOrderDetails }>(`/orders/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.order;
}

export function downloadAdminOrdersExport(query: AdminOrdersExportQuery) {
  const params = new URLSearchParams();
  params.set("period", query.period);
  params.set("status", query.status);
  return apiDownload(`/orders/admin/export?${params.toString()}`);
}

export function downloadAdminPurchaseOrder(id: string) {
  return apiDownload(`/orders/admin/${id}/purchase-order`);
}
