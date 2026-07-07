import { apiFetch } from "@/lib/api";

export type HeroSlide = {
  id: string;
  image: string;
  tagline: string;
  subtitle: string;
  title: string;
  description: string;
  ctaPrimary: { text: string; link: string };
  ctaSecondary: { text: string; link: string };
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HeroSlideInput = Omit<HeroSlide, "id" | "sortOrder" | "createdAt" | "updatedAt">;

export async function getActiveHeroSlides() {
  const response = await apiFetch<{ slides: HeroSlide[] }>("/content/hero");
  return response.slides;
}

export async function getAdminHeroSlides() {
  const response = await apiFetch<{ slides: HeroSlide[] }>("/admin/hero");
  return response.slides;
}

export async function updateHeroSlide(id: string, input: HeroSlideInput) {
  const response = await apiFetch<{ slide: HeroSlide }>(`/admin/hero/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.slide;
}

export async function toggleHeroSlide(id: string) {
  const response = await apiFetch<{ slide: HeroSlide }>(`/admin/hero/${id}/toggle`, {
    method: "PATCH",
  });
  return response.slide;
}

export async function reorderHeroSlides(ids: string[]) {
  const response = await apiFetch<{ slides: HeroSlide[] }>("/admin/hero/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  return response.slides;
}
