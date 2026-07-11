import { useEffect, useState, useCallback } from "react";
import { deleteCustomerWishlistItem, syncCustomerWishlist } from "@/lib/api";
import { getSession } from "@/lib/supabase";

const KEY = "soltani-wishlist";
const LEGACY_KEY = "soltani-wishlist";
let bootstrapPromise: Promise<void> | null = null;

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const emit = () => window.dispatchEvent(new Event("wishlist:change"));

const write = (slugs: string[]) => {
  sessionStorage.setItem(KEY, JSON.stringify([...new Set(slugs)]));
  emit();
};

const cleanupLegacyPersistentWishlist = () => {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    undefined;
  }
};

const syncRemote = async (slugs: string[]) => {
  const session = await getSession();
  if (!session?.accessToken) return;
  const products = await syncCustomerWishlist(slugs);
  write(products.map((product) => product.slug));
};

const deleteRemote = async (slug: string) => {
  const session = await getSession();
  if (!session?.accessToken) return;
  await deleteCustomerWishlistItem(slug);
};

const bootstrapWishlist = () => {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    cleanupLegacyPersistentWishlist();
    await syncRemote(read());
  })().catch(() => undefined);
  return bootstrapPromise;
};

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    cleanupLegacyPersistentWishlist();
    setSlugs(read());
    const sync = () => setSlugs(read());
    const syncAuth = () => {
      bootstrapPromise = null;
      void bootstrapWishlist();
    };
    window.addEventListener("wishlist:change", sync);
    window.addEventListener("auth:change", syncAuth);
    void bootstrapWishlist();
    return () => {
      window.removeEventListener("wishlist:change", sync);
      window.removeEventListener("auth:change", syncAuth);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    const exists = cur.includes(slug);
    const next = exists ? cur.filter((s) => s !== slug) : [...cur, slug];
    write(next);
    void (exists ? deleteRemote(slug) : syncRemote(next)).catch(() => undefined);
  }, []);

  const remove = useCallback((slug: string) => {
    const next = read().filter((s) => s !== slug);
    write(next);
    void deleteRemote(slug).catch(() => undefined);
  }, []);

  const reconcile = useCallback((validSlugs: string[]) => {
    const valid = new Set(validSlugs);
    const cur = read();
    const next = cur.filter((s) => valid.has(s));
    if (next.length !== cur.length) {
      write(next);
      void syncRemote(next).catch(() => undefined);
    }
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, remove, reconcile, has, count: slugs.length };
}
