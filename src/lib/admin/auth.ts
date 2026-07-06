import { getCurrentAdmin } from "@/lib/api";
import { getSession, signInWithPassword, signOut } from "@/lib/supabase";

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

  return admin;
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session?.accessToken) {
    return null;
  }

  try {
    return await getCurrentAdmin();
  } catch {
    await signOut();
    return null;
  }
}

export async function signOutAdmin() {
  await signOut();
}
