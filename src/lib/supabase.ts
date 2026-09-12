import { publicEnv } from "@/lib/env";
import { mapHttpErrorMessage, networkErrorMessage } from "@/lib/error-messages";

const SESSION_CACHE_TTL_MS = 30_000;
const LEGACY_AUTH_STORAGE_KEYS = ["soltani-auth-session", "soltani-admin-session"];
const SESSION_ONLY_KEYS = ["soltani-cart", "soltani-wishlist", "soltani-profile-cache"];
let cachedSession: SupabaseSession | null = null;
let sessionCacheExpiresAt = 0;
let sessionRefreshPromise: Promise<SupabaseSession | null> | null = null;

export type SupabaseSession = {
  expiresAt: number;
};

type AuthSessionResponse = {
  expiresAt?: number;
};

function apiUrl(path: string) {
  if (typeof window !== "undefined" && isProductionStorefrontHost(window.location.hostname)) {
    return `/api/v1${path}`;
  }

  return `${publicEnv.apiUrl}${path}`;
}

function isProductionStorefrontHost(hostname: string) {
  return hostname === "soltanisignature.com" || hostname === "www.soltanisignature.com";
}

export function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("soltani_csrf_token="));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice("soltani_csrf_token=".length));
  } catch {
    return null;
  }
}

async function authFetch(path: string, init: RequestInit = {}) {
  try {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);

    return await fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(networkErrorMessage());
  }
}

async function throwAuthError(response: Response): Promise<never> {
  let message = "";
  try {
    const body = (await response.json()) as { message?: string | string[]; error?: string };
    message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message ?? body.error ?? "";
  } catch {
    message = response.statusText;
  }
  throw new Error(mapHttpErrorMessage(message, response.status));
}

function cacheSession(expiresAt?: number) {
  cachedSession = {
    expiresAt: expiresAt && expiresAt * 1000 > Date.now()
      ? expiresAt * 1000
      : Date.now() + SESSION_CACHE_TTL_MS,
  };
  sessionCacheExpiresAt = Date.now() + SESSION_CACHE_TTL_MS;
  return cachedSession;
}

function clearLegacyAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) localStorage.removeItem(key);
  } catch {
    return;
  }
}

function emitAuthChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:change"));
}

function clearSessionOnlyCommerceState() {
  if (typeof window === "undefined") return;
  for (const key of SESSION_ONLY_KEYS) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("cart:change"));
  window.dispatchEvent(new Event("wishlist:change"));
}

export async function signInWithPassword(email: string, password: string) {
  clearLegacyAuthStorage();
  const response = await authFetch("/auth/session", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) await throwAuthError(response);
  const body = (await response.json()) as AuthSessionResponse;
  const session = cacheSession(body.expiresAt);
  emitAuthChange();
  return session;
}

export async function refreshSession() {
  if (sessionRefreshPromise) return sessionRefreshPromise;

  sessionRefreshPromise = (async () => {
    try {
      const response = await authFetch("/auth/session/refresh", { method: "POST" });
      if (!response.ok) return null;
      const body = (await response.json()) as AuthSessionResponse;
      const session = cacheSession(body.expiresAt);
      emitAuthChange();
      return session;
    } catch {
      return null;
    } finally {
      sessionRefreshPromise = null;
    }
  })();

  return sessionRefreshPromise;
}

export async function getSession() {
  clearLegacyAuthStorage();
  if (typeof window === "undefined") return null;
  if (cachedSession && sessionCacheExpiresAt > Date.now()) return cachedSession;

  let response = await authFetch("/auth/me");
  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      cachedSession = null;
      sessionCacheExpiresAt = 0;
      return null;
    }
    response = await authFetch("/auth/me");
  }

  if (!response.ok) {
    cachedSession = null;
    sessionCacheExpiresAt = 0;
    return null;
  }

  return cacheSession();
}

export async function signOut() {
  cachedSession = null;
  sessionCacheExpiresAt = 0;
  clearLegacyAuthStorage();
  clearSessionOnlyCommerceState();

  try {
    await authFetch("/auth/session", { method: "DELETE" });
  } catch {
    return;
  } finally {
    emitAuthChange();
  }
}

clearLegacyAuthStorage();
