import { apiFetch } from "@/lib/api";

export type AdminProductStatus = "draft" | "active" | "archived";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sku: string;
  lowStockThreshold: number;
  status: AdminProductStatus;
  isFeatured: boolean;
  isPromotion: boolean;
  discountPercentage: number | null;
  isBestSeller: boolean;
  brand: string;
  category: string;
  categoryName: string;
  subcategory: string | null;
  subcategoryName: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  images: Array<{ id?: string; url: string; alt?: string | null }>;
  attributes: Array<{ key: string; value: string }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductsQuery = {
  query?: string;
  status?: "all" | AdminProductStatus;
  category?: string;
  page?: number;
  pageSize?: number;
};

export type UpsertAdminProductInput = {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  sku: string;
  category: string;
  subcategory?: string;
  brand: string;
  tags?: string[];
  images?: Array<{ url: string; alt?: string }>;
  attributes?: Array<{ key: string; value: string }>;
  seoTitle?: string;
  seoDescription?: string;
  status: AdminProductStatus;
  isFeatured: boolean;
  isPromotion?: boolean;
  discountPercentage?: number | null;
  isBestSeller?: boolean;
  lowStockThreshold?: number;
};

export type AdminProductsResponse = {
  products: AdminProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export function getAdminProducts(query: AdminProductsQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set("query", query.query);
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  return apiFetch<AdminProductsResponse>(`/products/admin?${params.toString()}`);
}

export async function getAdminProduct(id: string) {
  const response = await apiFetch<{ product: AdminProduct }>(`/products/admin/${id}`);
  return response.product;
}

export async function createAdminProduct(input: UpsertAdminProductInput) {
  const response = await apiFetch<{ product: AdminProduct }>("/products/admin", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.product;
}

export async function updateAdminProduct(id: string, input: UpsertAdminProductInput) {
  const response = await apiFetch<{ product: AdminProduct }>(`/products/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.product;
}

export async function deleteAdminProduct(id: string) {
  return apiFetch<{ deleted?: boolean; archived?: boolean; product?: AdminProduct }>(
    `/products/admin/${id}`,
    { method: "DELETE" },
  );
}

export async function uploadAdminProductImage(file: File) {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });

  const response = await apiFetch<{ url: string }>("/products/admin/images", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64,
    }),
  });
  return response.url;
}

