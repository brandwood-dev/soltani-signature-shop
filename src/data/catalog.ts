import type { Product } from "@/components/site/ProductCard";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";
import p5 from "@/assets/prod-5.jpg";
import p6 from "@/assets/prod-6.jpg";
import p7 from "@/assets/prod-7.jpg";
import p8 from "@/assets/prod-8.jpg";

import watches from "@/assets/cat-watches.jpg";
import sunglasses from "@/assets/cat-sunglasses.jpg";
import perfumes from "@/assets/cat-perfumes.jpg";
import bags from "@/assets/cat-bags.jpg";
import jewelry from "@/assets/cat-jewelry.jpg";
import cosmetics from "@/assets/cat-cosmetics.jpg";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export type CategorySlug =
  | "montres"
  | "lunettes"
  | "parfums"
  | "sacs"
  | "bijoux"
  | "cosmetiques";

export const CATEGORIES: { slug: CategorySlug; name: string; count: string; image: string }[] = [
  { slug: "montres", name: "Montres", count: "240+ pièces", image: watches },
  { slug: "lunettes", name: "Lunettes", count: "180+ pièces", image: sunglasses },
  { slug: "parfums", name: "Parfums", count: "320+ pièces", image: perfumes },
  { slug: "sacs", name: "Sacs", count: "150+ pièces", image: bags },
  { slug: "bijoux", name: "Bijoux", count: "200+ pièces", image: jewelry },
  { slug: "cosmetiques", name: "Cosmétiques", count: "410+ pièces", image: cosmetics },
];

export const NAV_LINKS: { label: string; slug: CategorySlug | "promos"; type: "category" | "anchor" }[] = [
  { label: "Montres", slug: "montres", type: "category" },
  { label: "Lunettes", slug: "lunettes", type: "category" },
  { label: "Parfums", slug: "parfums", type: "category" },
  { label: "Sacs", slug: "sacs", type: "category" },
  { label: "Bijoux", slug: "bijoux", type: "category" },
  { label: "Cosmétiques", slug: "cosmetiques", type: "category" },
];

const make = (p: Omit<Product, "slug"> & { slug?: string }): Product => ({
  ...p,
  slug: p.slug ?? slugify(`${p.brand}-${p.name}`),
});

export const PRODUCTS: Product[] = [
  // Montres
  make({ name: "Chronographe Acier Noir", brand: "Tissot", category: "montres", price: 2890, oldPrice: 3400, image: p1, badge: "Best Seller", rating: 5 }),
  make({ name: "Montre Rose Gold Cuir", brand: "Rolex", category: "montres", price: 12500, image: p7, badge: "Nouveau", rating: 5 }),
  make({ name: "Automatique Squelette", brand: "Tissot", category: "montres", price: 3450, image: p1, rating: 4.7 }),
  make({ name: "Chronomaster Or 18k", brand: "Rolex", category: "montres", price: 18900, oldPrice: 21000, image: p7, badge: "Promo", rating: 5 }),

  // Lunettes
  make({ name: "Aviator Gold Lens Brown", brand: "Ray-Ban", category: "lunettes", price: 690, image: p2, badge: "Best Seller", rating: 4.5 }),
  make({ name: "Lunettes Carré Premium", brand: "Porsche Design", category: "lunettes", price: 980, image: p8, badge: "Nouveau", rating: 4.7 }),
  make({ name: "Wayfarer Édition Noire", brand: "Ray-Ban", category: "lunettes", price: 560, image: p2, rating: 4.6 }),
  make({ name: "Pilote Titane", brand: "Porsche Design", category: "lunettes", price: 1190, oldPrice: 1390, image: p8, badge: "Promo", rating: 4.8 }),

  // Parfums
  make({ name: "Eau de Parfum Ambré 100ml", brand: "Tom Ford", category: "parfums", price: 850, image: p3, rating: 5 }),
  make({ name: "Oud Signature 75ml", brand: "Tom Ford", category: "parfums", price: 1290, image: p3, badge: "Nouveau", rating: 4.9 }),
  make({ name: "Vanille Noire 50ml", brand: "YSL", category: "parfums", price: 520, oldPrice: 640, image: p3, badge: "Promo", rating: 4.7 }),

  // Sacs
  make({ name: "Sac Cabas Matelassé", brand: "Cartier", category: "sacs", price: 4200, oldPrice: 5200, image: p4, badge: "Promo", rating: 5 }),
  make({ name: "Pochette Cuir Lisse", brand: "Cartier", category: "sacs", price: 1850, image: p4, rating: 4.8 }),
  make({ name: "Tote Bag Signature", brand: "YSL", category: "sacs", price: 3290, image: p4, badge: "Nouveau", rating: 4.9 }),

  // Bijoux
  make({ name: "Pendentif Diamant Solitaire", brand: "Cartier", category: "bijoux", price: 6800, image: p5, badge: "Nouveau", rating: 5 }),
  make({ name: "Bague Or Rose Pavée", brand: "Cartier", category: "bijoux", price: 4900, image: p5, rating: 4.9 }),
  make({ name: "Bracelet Tennis Diamants", brand: "Cartier", category: "bijoux", price: 8900, oldPrice: 10500, image: p5, badge: "Promo", rating: 5 }),

  // Cosmétiques
  make({ name: "Rouge à Lèvres Mat Couture", brand: "YSL", category: "cosmetiques", price: 145, image: p6, badge: "Nouveau", rating: 4.8 }),
  make({ name: "Palette Yeux Édition Or", brand: "YSL", category: "cosmetiques", price: 320, image: p6, rating: 4.7 }),
  make({ name: "Sérum Éclat 30ml", brand: "Tom Ford", category: "cosmetiques", price: 450, oldPrice: 540, image: p6, badge: "Promo", rating: 4.6 }),
];

export const BESTSELLERS = PRODUCTS.filter((p) => p.badge === "Best Seller" || p.oldPrice).slice(0, 4);
export const NEWARRIVALS = PRODUCTS.filter((p) => p.badge === "Nouveau").slice(0, 4);

export const findProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const productsByCategory = (slug: string) => PRODUCTS.filter((p) => p.category === slug);

export const TOP_BRANDS: { name: string; slug: string; tagline: string; image: string }[] = [
  { name: "Rolex", slug: slugify("Rolex"), tagline: "Horlogerie d'exception", image: p7 },
  { name: "Cartier", slug: slugify("Cartier"), tagline: "Joaillerie & Maroquinerie", image: p5 },
  { name: "Tissot", slug: slugify("Tissot"), tagline: "Précision Suisse", image: p1 },
  { name: "Ray-Ban", slug: slugify("Ray-Ban"), tagline: "Icônes intemporelles", image: p2 },
  { name: "Porsche Design", slug: slugify("Porsche Design"), tagline: "Élégance technique", image: p8 },
  { name: "Tom Ford", slug: slugify("Tom Ford"), tagline: "Parfums signature", image: p3 },
  { name: "YSL", slug: slugify("YSL"), tagline: "Audace Couture", image: p6 },
];

export const findBrandBySlug = (slug: string) => {
  const all = Array.from(new Set(PRODUCTS.map((p) => p.brand)));
  return all.find((b) => slugify(b) === slug);
};
export const productsByBrand = (slug: string) =>
  PRODUCTS.filter((p) => slugify(p.brand) === slug);

export function searchProducts(q: string, limit = 6): Product[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.brand.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s),
  ).slice(0, limit);
}
