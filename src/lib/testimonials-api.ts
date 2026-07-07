import { apiFetch } from "@/lib/api";

export type Testimonial = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  name: string;
  text: string;
  gouvernorat: string;
  productTitle: string;
  productUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialInput = {
  rating: 1 | 2 | 3 | 4 | 5;
  name: string;
  text: string;
  gouvernorat: string;
  productTitle: string;
  productUrl?: string;
};

export async function getPublicTestimonials() {
  const response = await apiFetch<{ testimonials: Testimonial[] }>("/content/testimonials");
  return response.testimonials;
}

export async function getAdminTestimonials() {
  const response = await apiFetch<{ testimonials: Testimonial[] }>("/admin/testimonials");
  return response.testimonials;
}

export async function createTestimonial(input: TestimonialInput) {
  const response = await apiFetch<{ testimonial: Testimonial }>("/admin/testimonials", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.testimonial;
}

export async function updateTestimonial(id: string, input: TestimonialInput) {
  const response = await apiFetch<{ testimonial: Testimonial }>(`/admin/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.testimonial;
}

export async function deleteTestimonial(id: string) {
  await apiFetch<{ deleted: true }>(`/admin/testimonials/${id}`, {
    method: "DELETE",
  });
}
