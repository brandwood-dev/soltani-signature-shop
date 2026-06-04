import { PRODUCTS } from "@/data/catalog";
import type { Product } from "@/components/site/ProductCard";

// Picks up to N products from a given sub-category (or list of subs).
export function pickProducts(subSlugs: string | string[], n = 4): Product[] {
  const slugs = Array.isArray(subSlugs) ? subSlugs : [subSlugs];
  const pool = PRODUCTS.filter((p) => slugs.includes(p.category));
  return pool.slice(0, n);
}
