import type { CartLine } from "@/hooks/useCart";

const KEY = "soltani-quick-checkout";

export function saveQuickCheckoutLine(line: CartLine) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify([line]));
}

export function readQuickCheckoutLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((line) => Boolean(line?.variantId)) : [];
  } catch {
    return [];
  }
}

export function clearQuickCheckoutLines() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
