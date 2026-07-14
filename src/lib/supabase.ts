import { publicEnv } from "@/lib/env";
import { mapHttpErrorMessage, networkErrorMessage } from "@/lib/error-messages";

const STORAGE_KEY = "soltani-auth-session";
const LEGACY_ADMIN_STORAGE_KEY = "soltani-admin-session";
const SESSION_ONLY_KEYS = ["soltani-cart", "soltani-wishlist", "soltani-profile-cache"];
let cachedSession: SupabaseSession | null = null;
let sessionRefreshPromise: Promise<SupabaseSession | null> | null = null;

export type SupabaseSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type SupabaseTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

function saveSession(session: SupabaseSession) {
  cachedSession = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
}

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:change"));
  }
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

function readStoredSession() {
  if (cachedSession) return cachedSession;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_ADMIN_STORAGE_KEY);
    cachedSession = raw ? (JSON.parse(raw) as SupabaseSession) : null;
    return cachedSession;
  } catch {
    return null;
  }
}

function toSession(response: SupabaseTokenResponse): SupabaseSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  };
}

async function authRequest(path: string, init: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${publicEnv.supabaseUrl}/auth/v1${path}`, {
      ...init,
      headers: {
        apikey: publicEnv.supabaseAnonKey,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error(networkErrorMessage());
  }

  if (!response.ok) {
    let message = "";
    try {
      const body = (await response.json()) as { error_description?: string; msg?: string; message?: string; error?: string };
      message = body.error_description ?? body.msg ?? body.message ?? body.error ?? "";
    } catch {
      message = response.statusText;
    }
    throw new Error(mapHttpErrorMessage(message, response.status));
  }

  return response;
}

export async function signInWithPassword(email: string, password: string) {
  const response = await authRequest("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session = toSession((await response.json()) as SupabaseTokenResponse);
  saveSession(session);
  emitAuthChange();
  return session;
}

export async function getSession() {
  const session = readStoredSession();
  if (!session) {
    return null;
  }

  if (session.expiresAt - Date.now() > 60_000) {
    return session;
  }

  if (sessionRefreshPromise) {
    return sessionRefreshPromise;
  }

  sessionRefreshPromise = (async () => {
    const response = await authRequest("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
    const refreshedSession = toSession((await response.json()) as SupabaseTokenResponse);
    saveSession(refreshedSession);
    return refreshedSession;
  })();

  try {
    return await sessionRefreshPromise;
  } catch {
    cachedSession = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
    clearSessionOnlyCommerceState();
    emitAuthChange();
    return null;
  } finally {
    sessionRefreshPromise = null;
  }
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken ?? null;
}

export async function signOut() {
  const session = readStoredSession();
  cachedSession = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
  clearSessionOnlyCommerceState();
  emitAuthChange();

  if (!session?.accessToken) {
    return;
  }

  try {
    await authRequest("/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  } catch {
    return;
  }
}
