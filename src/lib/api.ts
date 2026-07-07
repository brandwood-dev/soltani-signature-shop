import { getSession } from "@/lib/supabase";
import { publicEnv } from "@/lib/env";

export type ApiUser = {
  id: string;
  authUserId: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "CUSTOMER" | "SUPER_ADMIN";
  status: "ACTIVE" | "DISABLED";
};

export type RegisterCustomerInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

type ApiErrorBody = {
  message?: string | string[];
};

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const session = await getSession();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetchWithRetry(`${publicEnv.apiUrl}${path}`, {
    cache: "no-store",
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

async function fetchWithRetry(url: string, init: RequestInit, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20_000);

    try {
      return await fetch(url, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => window.setTimeout(resolve, attempt * 500));
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error
    ? new Error("Connexion API momentanément indisponible. Réessayez dans quelques secondes.")
    : new Error("Connexion API momentanément indisponible.");
}

export async function getCurrentAdmin() {
  const response = await apiFetch<{ user: ApiUser }>("/admin/me");
  return response.user;
}

export async function getCurrentUser() {
  const response = await apiFetch<{ user: ApiUser }>("/auth/me");
  return response.user;
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const response = await apiFetch<{ user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.user;
}
