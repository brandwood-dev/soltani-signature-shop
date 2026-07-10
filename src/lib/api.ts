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

export type ContactMessageInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message?: string;
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

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const session = typeof window === "undefined" ? null : await getSession();

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
    const timeoutId = globalThis.setTimeout(() => controller.abort(), 20_000);

    try {
      return await fetch(url, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => globalThis.setTimeout(resolve, attempt * 500));
    } finally {
      globalThis.clearTimeout(timeoutId);
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
