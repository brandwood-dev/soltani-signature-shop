import { apiFetch } from "@/lib/api";

export type AdminProductStatus = "draft" | "active" | "archived";
export type AdminProductSection = "homme" | "femme" | "enfant" | "maison" | "bien-etre";
export type AdminProductVariantMode = "simple" | "color" | "options";
export type AdminVariantDisplayType = "swatch" | "button" | "select";

export type AdminProductVariantOptionValue = {
  id?: string;
  value: string;
  label: string;
  code: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type AdminProductVariantAxis = {
  id?: string;
  key: string;
  label: string;
  displayType: AdminVariantDisplayType;
  isActive: boolean;
  sortOrder: number;
  values: AdminProductVariantOptionValue[];
};

export type AdminProductVariantSelection = {
  axisId?: string;
  axisKey: string;
  axisLabel?: string;
  valueId?: string;
  value: string;
  label?: string;
  code?: string | null;
  colorHex?: string | null;
  imageUrl?: string | null;
};

export type AdminProductVariant = {
  id?: string;
  sku: string;
  label: string;
  reference: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  selections?: AdminProductVariantSelection[];
};

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
  variantMode?: AdminProductVariantMode;
  variantAxes?: AdminProductVariantAxis[];
  variants?: AdminProductVariant[];
  status: AdminProductStatus;
  section: AdminProductSection;
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
  section?: AdminProductSection;
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
  sku?: string;
  variantMode?: AdminProductVariantMode;
  variantAxes?: AdminProductVariantAxis[];
  variants?: AdminProductVariant[];
  category: string;
  section: AdminProductSection;
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

export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGE_SIZE_MB = 5;

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
  if (query.section) params.set("section", query.section);
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

export function createAdminProductPreview(id: string, input: UpsertAdminProductInput) {
  return apiFetch<{ token: string; previewUrl: string; expiresAt: string }>(
    `/products/admin/${id}/preview`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteAdminProduct(id: string) {
  return apiFetch<{ deleted?: boolean; archived?: boolean; product?: AdminProduct }>(
    `/products/admin/${id}`,
    { method: "DELETE" },
  );
}

export async function uploadAdminProductImage(file: File) {
  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    throw new Error(
      `L'image "${file.name}" dépasse la taille maximale autorisée de ${MAX_PRODUCT_IMAGE_SIZE_MB} Mo.`,
    );
  }

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
