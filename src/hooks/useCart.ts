import { useEffect, useState, useCallback } from "react";
import p1 from "@/assets/prod-1.jpg";
import p3 from "@/assets/prod-3.jpg";
import p5 from "@/assets/prod-5.jpg";

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

const DEFAULT_LINES: CartLine[] = [
  { id: "1", name: "Chronographe Acier Noir", brand: "Tissot", price: 2890, qty: 1, image: p1, variant: "Noir · 42mm" },
  { id: "2", name: "Eau de Parfum Ambré 100ml", brand: "Tom Ford", price: 850, qty: 2, image: p3, variant: "100ml" },
  { id: "3", name: "Pendentif Diamant Solitaire", brand: "Cartier", price: 6800, qty: 1, image: p5, variant: "Or 18k" },
];

const read = (): CartLine[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_LINES));
      return DEFAULT_LINES;
    }
    return JSON.parse(raw) as CartLine[];
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
