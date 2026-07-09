import { useEffect, useState, useCallback } from "react";
import { deleteCustomerWishlistItem, syncCustomerWishlist } from "@/lib/api";
import { getSession } from "@/lib/supabase";

const KEY = "soltani-wishlist";

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const emit = () => window.dispatchEvent(new Event("wishlist:change"));

const write = (slugs: string[]) => {
  localStorage.setItem(KEY, JSON.stringify([...new Set(slugs)]));
  emit();
};

const syncRemote = async (slugs: string[]) => {
  const session = await getSession();
  if (!session?.accessToken) return;
  const products = await syncCustomerWishlist(slugs);
  write(products.map((product) => product.slug));
};

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
    const sync = () => setSlugs(read());
    window.addEventListener("wishlist:change", sync);
    window.addEventListener("storage", sync);
    void syncRemote(read()).catch(() => undefined);
    return () => {
      window.removeEventListener("wishlist:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    const exists = cur.includes(slug);
    const next = exists ? cur.filter((s) => s !== slug) : [...cur, slug];
    write(next);
    void (exists ? deleteCustomerWishlistItem(slug) : syncRemote(next)).catch(() => undefined);
  }, []);

  const remove = useCallback((slug: string) => {
    const next = read().filter((s) => s !== slug);
    write(next);
    void deleteCustomerWishlistItem(slug).catch(() => undefined);
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
