import { apiFetch, publicApiFetch } from "@/lib/api";

export type PromoBanner = {
  id: string;
  page: string;
  kind: "promotion" | "limited_offer";
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  sortOrder: number;
  durationDays?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PromoBannerInput = {
  page: string;
  kind?: "promotion" | "limited_offer";
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  sortOrder?: number;
  durationDays?: number | null;
  startsAt?: string | null;
};

export type PromoBannersAdminResponse = {
  banners: PromoBanner[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  countsByPage: Record<string, number>;
};

export async function getActivePromoBanners(page?: string, kind?: PromoBanner["kind"]) {
  const search = new URLSearchParams();
  if (page) search.set("page", page);
  if (kind) search.set("kind", kind);
  const response = await publicApiFetch<{ banners: PromoBanner[] }>(
    `/content/promo-banners${search.size ? `?${search}` : ""}`,
  );
  return response.banners;
}

export async function getActiveLimitedOffer() {
  const banners = await getActivePromoBanners("home", "limited_offer");
  const now = Date.now();
  return banners.find((banner) => banner.endsAt && new Date(banner.endsAt).getTime() > now) ?? null;
}

export async function getAdminPromoBanners(params: { page?: string; pageIndex?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", params.page);
  if (params.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  return apiFetch<PromoBannersAdminResponse>(`/admin/promo-banners${search.size ? `?${search}` : ""}`);
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
