import type { Product } from "@/components/site/ProductCard";

// Product sections are populated only from the real catalogue API.
export function pickProducts(subSlugs: string | string[], n = 4): Product[] {
  void subSlugs;
  void n;
  return [];
}
