import { useEffect, useState, useCallback } from "react";

export type CartLine = {
  id: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  image: string;
  variant: string;
};

const KEY = "soltani-cart";

const read = (): CartLine[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
};

const write = (lines: CartLine[]) => {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("cart:change"));
};

export function openCartDrawer() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:open"));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(read());
    const sync = () => setLines(read());
    window.addEventListener("cart:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((id: string, qty: number) => {
    const next = read().map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l));
    write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => {
    localStorage.setItem(KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("cart:change"));
  }, []);

  const add = useCallback((item: Omit<CartLine, "qty"> & { qty?: number }) => {
    const cur = read();
    const qty = item.qty ?? 1;
    const idx = cur.findIndex((l) => l.id === item.id);
    let next: CartLine[];
    if (idx >= 0) {
      next = cur.map((l, i) => (i === idx ? { ...l, qty: l.qty + qty } : l));
    } else {
      next = [...cur, { ...item, qty }];
    }
    write(next);
    openCartDrawer();
  }, []);

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

  return { lines, add, update, remove, clear, count, subtotal };
}
