import { getCurrentAdmin } from "@/lib/api";
import { createAdminLoginNotification } from "@/lib/admin-notifications-api";
import { getSession, signInWithPassword, signOut } from "@/lib/supabase";
import type { ApiUser } from "@/lib/api";

const ADMIN_CACHE_TTL_MS = 5 * 60_000;
let cachedAdmin: { user: ApiUser; expiresAt: number; accessToken: string } | null = null;

export async function signInAdmin(email: string, password: string) {
  try {
    await signInWithPassword(email, password);
  } catch {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const admin = await getCurrentAdmin();
  if (admin.role !== "SUPER_ADMIN") {
    await signOut();
    throw new Error("Accès refusé : ce compte n'est pas administrateur.");
  }

  createAdminLoginNotification().catch(() => undefined);
  const session = await getSession();
  if (session?.accessToken) {
    cachedAdmin = {
      user: admin,
      expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
      accessToken: session.accessToken,
    };
  }

  return admin;
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session?.accessToken) {
    cachedAdmin = null;
    return null;
  }

  if (
    cachedAdmin
    && cachedAdmin.accessToken === session.accessToken
    && cachedAdmin.expiresAt > Date.now()
  ) {
    return cachedAdmin.user;
  }

  try {
    const admin = await getCurrentAdmin();
    cachedAdmin = {
      user: admin,
      expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
      accessToken: session.accessToken,
    };
    return admin;
  } catch {
    cachedAdmin = null;
    await signOut();
    return null;
  }
}

export async function signOutAdmin() {
  cachedAdmin = null;
  await signOut();
}

if (typeof window !== "undefined") {
  window.addEventListener("auth:change", () => {
    cachedAdmin = null;
  });
}
