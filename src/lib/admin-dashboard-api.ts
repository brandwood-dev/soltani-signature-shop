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

export type AdminDashboardKpisResponse = Pick<AdminDashboardResponse, "period" | "kpis">;
export type AdminDashboardRevenueSeriesResponse = Pick<AdminDashboardResponse, "period" | "series">;
export type AdminDashboardTopProductsResponse = Pick<AdminDashboardResponse, "topProducts">;
export type AdminDashboardRecentOrdersResponse = Pick<AdminDashboardResponse, "recentOrders">;
export type AdminDashboardStockSummaryResponse = {
  products: number;
  lowStock: number;
};

export function getAdminDashboard(period: DatePeriod) {
  const params = new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
  });

  return apiFetch<AdminDashboardResponse>(`/admin/dashboard?${params.toString()}`);
}

function periodParams(period: DatePeriod) {
  return new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
  });
}

export function getAdminDashboardKpis(period: DatePeriod) {
  return apiFetch<AdminDashboardKpisResponse>(`/admin/dashboard/kpis?${periodParams(period).toString()}`);
}

export function getAdminDashboardRevenueSeries(period: DatePeriod) {
  return apiFetch<AdminDashboardRevenueSeriesResponse>(`/admin/dashboard/revenue-series?${periodParams(period).toString()}`);
}

export function getAdminDashboardTopProducts(period: DatePeriod) {
  return apiFetch<AdminDashboardTopProductsResponse>(`/admin/dashboard/top-products?${periodParams(period).toString()}`);
}

export function getAdminDashboardRecentOrders() {
  return apiFetch<AdminDashboardRecentOrdersResponse>("/admin/dashboard/recent-orders");
}

export function getAdminDashboardStockSummary() {
  return apiFetch<AdminDashboardStockSummaryResponse>("/admin/dashboard/stock-summary");
}
