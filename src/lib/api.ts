import { getAccessToken } from "@/lib/supabase";
import { publicEnv } from "@/lib/env";
import { mapHttpErrorMessage, networkErrorMessage } from "@/lib/error-messages";

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

export type ContactMessageInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message?: string;
};

export type PasswordResetRequestInput = {
  email: string;
};

export type PasswordResetVerifyInput = {
  email: string;
  code: string;
};

export type PasswordResetConfirmInput = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

export type ApiAddress = {
  id: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  governorate: string;
  postalCode: string | null;
  isDefault: boolean;
};

export type ApiCustomerOrder = {
  id: string;
  reference: string;
  status: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    image: string;
    qty: number;
    price: number;
    total: number;
  }>;
};

export type ApiWishlistProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug?: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: "Best Seller" | "Nouveau" | "Promo";
  variantId?: string;
  variantLabel?: string;
  stockQuantity?: number;
  gallery?: string[];
};

export type ApiCartLine = {
  id: string;
  productSlug?: string;
  variantId: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  image: string;
  variant: string;
};

export type CustomerProfile = {
  user: ApiUser;
  addresses: ApiAddress[];
  orders: ApiCustomerOrder[];
  wishlist: ApiWishlistProduct[];
  cart?: ApiCartLine[];
  stats: {
    orders: number;
    wishlist: number;
    addresses: number;
    cart?: number;
  };
};

export type UpdateProfileInput = {
  fullName: string;
  phone?: string;
};

export type AddressInput = {
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  city: string;
  governorate: string;
  isDefault?: boolean;
};

type ApiErrorBody = {
  message?: string | string[];
};

type CachedApiValue = {
  expiresAt: number;
  value: unknown;
};

const responseCache = new Map<string, CachedApiValue>();
const inflightRequests = new Map<string, Promise<unknown>>();

const ADMIN_CACHE_RULES: Array<{ prefix: string; ttlMs: number }> = [
  { prefix: "/catalog/products", ttlMs: 30_000 },
  { prefix: "/admin/me", ttlMs: 60_000 },
  { prefix: "/admin/dashboard", ttlMs: 30_000 },
  { prefix: "/admin/customers", ttlMs: 30_000 },
  { prefix: "/orders/admin", ttlMs: 30_000 },
  { prefix: "/products/admin", ttlMs: 30_000 },
  { prefix: "/admin/categories", ttlMs: 60_000 },
  { prefix: "/admin/hero", ttlMs: 60_000 },
  { prefix: "/admin/marquee", ttlMs: 60_000 },
  { prefix: "/admin/featured-brands", ttlMs: 60_000 },
  { prefix: "/admin/promo-banners", ttlMs: 30_000 },
  { prefix: "/admin/settings", ttlMs: 60_000 },
  { prefix: "/admin/testimonials", ttlMs: 60_000 },
];

const ADMIN_INVALIDATION_PREFIXES = [
  "/catalog/products",
  "/admin/me",
  "/admin/dashboard",
  "/admin/notifications",
  "/admin/customers",
  "/orders/admin",
  "/products/admin",
  "/admin/categories",
  "/admin/hero",
  "/admin/marquee",
  "/admin/featured-brands",
  "/admin/promo-banners",
  "/admin/settings",
  "/admin/testimonials",
];

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const accessToken = typeof window === "undefined" ? null : await getAccessToken();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const method = (init.method ?? "GET").toUpperCase();
  const cacheKey = buildCacheKey(path, method, headers.get("Authorization"));
  const ttlMs = getAdminCacheTtl(path, method);

  if (ttlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
      return inflight as Promise<T>;
    }
  }

  const response = await fetchWithRetry(`${publicEnv.apiUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  }, { path, method });

  if (!response.ok) {
    let message = "Une erreur est survenue.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(mapHttpErrorMessage(message, response.status));
  }

  const bodyPromise = response.json() as Promise<T>;
  if (ttlMs <= 0) {
    const body = await bodyPromise;
    if (method !== "GET") {
      invalidateAdminCache(path);
    }
    return body;
  }

  const trackedPromise = bodyPromise
    .then((body) => {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + ttlMs,
        value: body,
      });
      return body;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, trackedPromise);
  return trackedPromise;
}

export async function apiDownload(path: string, init: RequestInit = {}) {
  const accessToken = typeof window === "undefined" ? null : await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/pdf");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const method = (init.method ?? "GET").toUpperCase();
  const response = await fetchWithRetry(`${publicEnv.apiUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  }, { path, method });

  if (!response.ok) {
    let message = "TÃ©lÃ©chargement impossible.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(mapHttpErrorMessage(message, response.status));
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? "document.pdf",
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function fetchWithRetry(url: string, init: RequestInit, options: { path: string; method: string }) {
  let lastError: unknown;
  const isGet = options.method === "GET";
  const attempts = isGet ? 2 : 1;
  const timeoutMs = isGet && isAdminPath(options.path) ? 10_000 : 15_000;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
      if (!shouldRetryResponse(response, attempt, attempts, isGet)) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => globalThis.setTimeout(resolve, attempt * 500));
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  throw new Error(networkErrorMessage());
}

function buildCacheKey(path: string, method: string, authorization: string | null) {
  return `${method}:${path}:${authorization ?? "guest"}`;
}

function getAdminCacheTtl(path: string, method: string) {
  if (method !== "GET") return 0;
  const normalizedPath = stripQuery(path);
  const rule = ADMIN_CACHE_RULES.find(({ prefix }) => normalizedPath.startsWith(prefix));
  return rule?.ttlMs ?? 0;
}

function stripQuery(path: string) {
  return path.split("?")[0] ?? path;
}

function isAdminPath(path: string) {
  const normalizedPath = stripQuery(path);
  return normalizedPath.startsWith("/admin")
    || normalizedPath.startsWith("/orders/admin")
    || normalizedPath.startsWith("/products/admin");
}

function shouldRetryResponse(response: Response, attempt: number, attempts: number, isGet: boolean) {
  if (!isGet || attempt >= attempts) return false;
  if (response.status >= 400 && response.status < 500) return false;
  return response.status >= 500;
}

function invalidateAdminCache(path: string) {
  const normalizedPath = stripQuery(path);
  const matchedPrefix = ADMIN_INVALIDATION_PREFIXES.find((prefix) => normalizedPath.startsWith(prefix));
  if (!matchedPrefix) return;
  const prefixesToInvalidate = new Set([matchedPrefix]);
  if (normalizedPath.startsWith("/products/admin")) {
    prefixesToInvalidate.add("/catalog/products");
  }

  for (const key of responseCache.keys()) {
    if ([...prefixesToInvalidate].some((prefix) => key.includes(`:${prefix}`))) {
      responseCache.delete(key);
    }
  }
}

export async function getCurrentAdmin() {
  const response = await apiFetch<{ user: ApiUser }>("/admin/me");
  return response.user;
}

export async function getCurrentUser() {
  const response = await apiFetch<{ user: ApiUser }>("/auth/me");
  return response.user;
}

export async function getCustomerProfile() {
  return apiFetch<CustomerProfile>("/auth/profile");
}

export async function updateCustomerProfile(input: UpdateProfileInput) {
  const response = await apiFetch<{ user: ApiUser }>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.user;
}

export async function createCustomerAddress(input: AddressInput) {
  const response = await apiFetch<{ address: ApiAddress }>("/auth/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.address;
}

export async function updateCustomerAddress(id: string, input: AddressInput) {
  const response = await apiFetch<{ address: ApiAddress }>(`/auth/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.address;
}

export async function deleteCustomerAddress(id: string) {
  return apiFetch<{ success: boolean }>(`/auth/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function syncCustomerWishlist(slugs: string[]) {
  const response = await apiFetch<{ wishlist: ApiWishlistProduct[] }>("/auth/wishlist/sync", {
    method: "POST",
    body: JSON.stringify({ slugs }),
  });
  return response.wishlist;
}

export async function deleteCustomerWishlistItem(slug: string) {
  return apiFetch<{ success: boolean }>(`/auth/wishlist/${slug}`, {
    method: "DELETE",
  });
}

export async function getCustomerCart() {
  const response = await apiFetch<{ cart: ApiCartLine[] }>("/auth/cart");
  return response.cart;
}

export async function syncCustomerCart(lines: Array<{ variantId: string; quantity: number }>) {
  const response = await apiFetch<{ cart: ApiCartLine[] }>("/auth/cart/sync", {
    method: "POST",
    body: JSON.stringify({ lines }),
  });
  return response.cart;
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const response = await apiFetch<{ user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.user;
}

export async function requestPasswordReset(input: PasswordResetRequestInput) {
  return apiFetch<{ success: boolean; message: string }>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyPasswordReset(input: PasswordResetVerifyInput) {
  return apiFetch<{ success: boolean; message: string }>("/auth/password-reset/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function confirmPasswordReset(input: PasswordResetConfirmInput) {
  return apiFetch<{ success: boolean; message: string }>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function subscribeNewsletter(email: string) {
  return apiFetch<{ success: boolean }>("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({
      email,
      source: "site_newsletter",
    }),
  });
}

export async function sendContactMessage(input: ContactMessageInput) {
  return apiFetch<{ success: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
