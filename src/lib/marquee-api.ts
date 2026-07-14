import { apiFetch, publicApiFetch } from "@/lib/api";

export type MarqueeMessage = {
  id: string;
  text: string;
  link: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MarqueeMessageInput = {
  text: string;
  link?: string;
  active: boolean;
};

export async function getActiveMarqueeMessages() {
  const response = await publicApiFetch<{ messages: MarqueeMessage[] }>("/content/top-banner");
  return response.messages;
}

export async function getAdminMarqueeMessages() {
  const response = await apiFetch<{ messages: MarqueeMessage[] }>("/admin/marquee");
  return response.messages;
}

export async function createMarqueeMessage(input: MarqueeMessageInput) {
  const response = await apiFetch<{ message: MarqueeMessage }>("/admin/marquee", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.message;
}

export async function updateMarqueeMessage(id: string, input: MarqueeMessageInput) {
  const response = await apiFetch<{ message: MarqueeMessage }>(`/admin/marquee/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.message;
}

export async function deleteMarqueeMessage(id: string) {
  await apiFetch<{ deleted: true }>(`/admin/marquee/${id}`, {
    method: "DELETE",
  });
}

export async function toggleMarqueeMessage(id: string) {
  const response = await apiFetch<{ message: MarqueeMessage }>(`/admin/marquee/${id}/toggle`, {
    method: "PATCH",
  });
  return response.message;
}

export async function reorderMarqueeMessages(ids: string[]) {
  const response = await apiFetch<{ messages: MarqueeMessage[] }>("/admin/marquee/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  return response.messages;
}
