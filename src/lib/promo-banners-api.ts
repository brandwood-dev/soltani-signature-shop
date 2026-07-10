import { apiFetch } from "@/lib/api";

export type PromoBanner = {
  id: string;
  page: string;
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PromoBannerInput = {
  page: string;
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  sortOrder?: number;
};

export async function getActivePromoBanners(page?: string) {
  const search = new URLSearchParams();
  if (page) search.set("page", page);
  const response = await apiFetch<{ banners: PromoBanner[] }>(
    `/content/promo-banners${search.size ? `?${search}` : ""}`,
  );
  return response.banners;
}

export async function getAdminPromoBanners() {
  const response = await apiFetch<{ banners: PromoBanner[] }>("/admin/promo-banners");
  return response.banners;
}

export async function createPromoBanner(input: PromoBannerInput) {
  const response = await apiFetch<{ banner: PromoBanner }>("/admin/promo-banners", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.banner;
}

export async function updatePromoBanner(id: string, input: PromoBannerInput) {
  const response = await apiFetch<{ banner: PromoBanner }>(`/admin/promo-banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.banner;
}

export async function togglePromoBanner(id: string) {
  const response = await apiFetch<{ banner: PromoBanner }>(`/admin/promo-banners/${id}/toggle`, {
    method: "PATCH",
  });
  return response.banner;
}

export async function deletePromoBanner(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/promo-banners/${id}`, {
    method: "DELETE",
  });
}
