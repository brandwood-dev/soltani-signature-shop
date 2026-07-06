import { getSession } from "@/lib/supabase";
import { publicEnv } from "@/lib/env";

export type ApiUser = {
  id: string;
  authUserId: string;
  email: string;
  role: "CUSTOMER" | "SUPER_ADMIN";
  status: "ACTIVE" | "DISABLED";
};

type ApiErrorBody = {
  message?: string | string[];
};

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const session = await getSession();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${publicEnv.apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = "Une erreur est survenue.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getCurrentAdmin() {
  const response = await apiFetch<{ user: ApiUser }>("/admin/me");
  return response.user;
}
