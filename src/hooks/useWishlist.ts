import { useEffect, useState, useCallback } from "react";

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

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
    const sync = () => setSlugs(read());
    window.addEventListener("wishlist:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    emit();
  }, []);

  const remove = useCallback((slug: string) => {
    const next = read().filter((s) => s !== slug);
    localStorage.setItem(KEY, JSON.stringify(next));
    emit();
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, remove, has, count: slugs.length };
}
