import { useCallback, useEffect, useState } from "react";

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

const read = (): CartLine[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((line) => Boolean(line.variantId)) : [];
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
    const next = read().map((line) => (line.id === id ? { ...line, qty: Math.max(1, qty) } : line));
    write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => {
    write([]);
  }, []);

  const add = useCallback((item: Omit<CartLine, "qty"> & { qty?: number }) => {
    const current = read();
    const qty = item.qty ?? 1;
    const idx = current.findIndex((line) => line.variantId === item.variantId);
    const next =
      idx >= 0
        ? current.map((line, index) => (index === idx ? { ...line, qty: line.qty + qty } : line))
        : [...current, { ...item, qty }];

    write(next);
    openCartDrawer();
  }, []);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  return { lines, add, update, remove, clear, count, subtotal };
}
