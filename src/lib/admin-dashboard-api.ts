import type { DatePeriod } from "@/components/admin/DateRangeFilter";
import { apiFetch } from "@/lib/api";
import type { AdminOrderStatus } from "@/lib/admin-orders-api";

export type AdminDashboardResponse = {
  period: {
    from: string;
    to: string;
  };
  kpis: {
    revenue: number;
    revenueDelta: number;
    orders: number;
    ordersDelta: number;
    customers: number;
    customersDelta: number;
    averageBasket: number;
    averageBasketDelta: number;
    products: number;
    lowStock: number;
  };
  series: Array<{
    day: string;
    value: number;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    brand: string;
    image: string;
    sold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    reference: string;
    customer: string;
    email: string;
    total: number;
    items: number;
    status: AdminOrderStatus;
    createdAt: string;
  }>;
};

export function getAdminDashboard(period: DatePeriod) {
  const params = new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
  });

  return apiFetch<AdminDashboardResponse>(`/admin/dashboard?${params.toString()}`);
}
