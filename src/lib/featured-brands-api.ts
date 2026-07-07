import { apiFetch } from "@/lib/api";

export type FeaturedBrand = {
  id: string;
  name: string;
  logo: string;
  link: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedBrandInput = {
  name: string;
  logo: string;
  link?: string;
  sortOrder: number;
  active: boolean;
};

export async function getActiveFeaturedBrands() {
  const response = await apiFetch<{ brands: FeaturedBrand[] }>("/content/featured-brands");
  return response.brands;
}

export async function getAdminFeaturedBrands() {
  const response = await apiFetch<{ brands: FeaturedBrand[] }>("/admin/featured-brands");
  return response.brands;
}

export async function createFeaturedBrand(input: FeaturedBrandInput) {
  const response = await apiFetch<{ brand: FeaturedBrand }>("/admin/featured-brands", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.brand;
}

export async function updateFeaturedBrand(id: string, input: FeaturedBrandInput) {
  const response = await apiFetch<{ brand: FeaturedBrand }>(`/admin/featured-brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.brand;
}

export async function deleteFeaturedBrand(id: string) {
  await apiFetch<{ deleted: true }>(`/admin/featured-brands/${id}`, {
    method: "DELETE",
  });
}

export async function toggleFeaturedBrand(id: string) {
  const response = await apiFetch<{ brand: FeaturedBrand }>(`/admin/featured-brands/${id}/toggle`, {
    method: "PATCH",
  });
  return response.brand;
}

export async function reorderFeaturedBrands(ids: string[]) {
  const response = await apiFetch<{ brands: FeaturedBrand[] }>("/admin/featured-brands/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  return response.brands;
}
