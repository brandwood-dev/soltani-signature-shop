import { apiFetch } from "@/lib/api";

export type AdminCustomerStatus = "active" | "blocked";

export type AdminCustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AdminCustomerStatus;
  createdAt: string;
  orders: number;
  spent: number;
  lastOrderAt: string | null;
  governorate: string;
  city: string;
};

export type AdminCustomerDetails = AdminCustomerListItem & {
  updatedAt: string;
  recentOrders: Array<{
    id: string;
    reference: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    label: string | null;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    governorate: string;
    postalCode: string | null;
    isDefault: boolean;
  }>;
};

export type AdminCustomersResponse = {
  customers: AdminCustomerListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type AdminCustomersQuery = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export function getAdminCustomers(query: AdminCustomersQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set("query", query.query);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  return apiFetch<AdminCustomersResponse>(`/admin/customers?${params.toString()}`);
}

export async function getAdminCustomer(id: string) {
  const response = await apiFetch<{ customer: AdminCustomerDetails }>(`/admin/customers/${id}`);
  return response.customer;
}

export async function updateAdminCustomerStatus(id: string, status: AdminCustomerStatus) {
  const response = await apiFetch<{ customer: AdminCustomerListItem }>(`/admin/customers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.customer;
}
