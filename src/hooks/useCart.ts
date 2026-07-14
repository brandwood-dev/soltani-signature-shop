import { useCallback, useEffect, useState } from "react";
import { getCustomerCart, syncCustomerCart } from "@/lib/api";
import { getSession } from "@/lib/supabase";

export type CartLine = {
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

const KEY = "soltani-cart";
const LEGACY_KEY = "soltani-cart";
let bootstrapPromise: Promise<void> | null = null;

const read = (): CartLine[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((line) => Boolean(line.variantId)) : [];
  } catch {
    return [];
  }
};

const write = (lines: CartLine[]) => {
  sessionStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("cart:change"));
};

const cleanupLegacyPersistentCart = () => {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    undefined;
  }
};

const persistRemote = async (lines: CartLine[]) => {
  const session = await getSession();
  if (!session?.accessToken) return;
  await syncCustomerCart(lines.map((line) => ({ variantId: line.variantId, quantity: line.qty })));
};

const mergeCartLines = (localLines: CartLine[], remoteLines: CartLine[]) => {
  const merged = new Map<string, CartLine>();
  for (const line of remoteLines) merged.set(line.variantId, line);
  for (const line of localLines) {
    merged.set(line.variantId, {
      ...line,
      qty: Math.max(line.qty, merged.get(line.variantId)?.qty ?? 0),
    });
  }
  return [...merged.values()];
};

const bootstrapCart = () => {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    cleanupLegacyPersistentCart();
    const session = await getSession();
    if (!session?.accessToken) return;
    const remoteCart = await getCustomerCart();
    const merged = mergeCartLines(read(), remoteCart);
    write(merged);
    await persistRemote(merged);
  })().catch(() => undefined);
  return bootstrapPromise;
};

export function openCartDrawer() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:open"));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    cleanupLegacyPersistentCart();
    setLines(read());
    const sync = () => setLines(read());
    const syncAuth = () => {
      bootstrapPromise = null;
      void bootstrapCart();
    };
    window.addEventListener("cart:change", sync);
    window.addEventListener("auth:change", syncAuth);
    void bootstrapCart();
    return () => {
      window.removeEventListener("cart:change", sync);
      window.removeEventListener("auth:change", syncAuth);
    };
  }, []);

  const update = useCallback((id: string, qty: number) => {
    const next = read().map((line) => (line.id === id ? { ...line, qty: Math.max(1, qty) } : line));
    write(next);
    void persistRemote(next).catch(() => undefined);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((line) => line.id !== id);
    write(next);
    void persistRemote(next).catch(() => undefined);
  }, []);

  const clear = useCallback(() => {
    write([]);
    void persistRemote([]).catch(() => undefined);
  }, []);

  const add = useCallback((item: Omit<CartLine, "qty"> & { qty?: number }, options: { openDrawer?: boolean } = {}) => {
    const current = read();
    const qty = item.qty ?? 1;
    const idx = current.findIndex((line) => line.variantId === item.variantId);
    const next =
      idx >= 0
        ? current.map((line, index) => (index === idx ? { ...line, qty: line.qty + qty } : line))
        : [...current, { ...item, qty }];

    write(next);
    void persistRemote(next).catch(() => undefined);
    if (options.openDrawer !== false) openCartDrawer();
  }, []);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  return { lines, add, update, remove, clear, count, subtotal };
}
