import type { Product } from "@/components/site/ProductCard";
import { buildProductAttributes } from "@/data/filters";
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

// Tout slug est une simple string : peut être un parent OU une sous-catégorie.
export type CategorySlug = string;

export type SubCategory = {
  slug: string;
  name: string;
  parentSlug: string;
};

export type ParentCategory = {
  slug: string;
  name: string;
  image: string;
  subs: SubCategory[];
};

// ============================================================
// Arborescence
// ============================================================

const TREE_DEF: {
  slug: string;
  name: string;
  image: string;
  subs: { slug: string; name: string }[];
}[] = [
  {
    slug: "parfums-fragrances",
    name: "Parfums & Fragrances",
    image: perfumes,
    subs: [
      { slug: "parfums", name: "Parfums" },
      { slug: "brumes-parfumees", name: "Brumes parfumées" },
      { slug: "coffrets-parfum", name: "Coffrets parfum" },
    ],
  },
  {
    slug: "maquillage",
    name: "Maquillage",
    image: cosmetics,
    subs: [
      { slug: "teint", name: "Teint" },
      { slug: "yeux", name: "Yeux" },
      { slug: "levres", name: "Lèvres" },
      { slug: "accessoires-maquillage", name: "Accessoires maquillage" },
    ],
  },
  {
    slug: "soins-visage",
    name: "Soins du Visage",
    image: p6,
    subs: [
      { slug: "nettoyants", name: "Nettoyants" },
      { slug: "serums", name: "Sérums" },
      { slug: "cremes-hydratantes", name: "Crèmes hydratantes" },
      { slug: "masques", name: "Masques" },
      { slug: "contour-yeux", name: "Contour des yeux" },
    ],
  },
  {
    slug: "cheveux",
    name: "Cheveux",
    image: p3,
    subs: [
      { slug: "shampoings", name: "Shampoings" },
      { slug: "apres-shampoings", name: "Après-shampoings" },
      { slug: "masques-capillaires", name: "Masques capillaires" },
      { slug: "huiles-serums", name: "Huiles et sérums" },
      { slug: "coiffage", name: "Coiffage" },
    ],
  },
  {
    slug: "protection-solaire",
    name: "Protection Solaire",
    image: p8,
    subs: [
      { slug: "solaires-visage", name: "Crèmes solaires visage" },
      { slug: "solaires-corps", name: "Crèmes solaires corps" },
      { slug: "apres-soleil", name: "Après-soleil" },
    ],
  },
  {
    slug: "mode-style",
    name: "Mode & Style",
    image: bags,
    subs: [
      { slug: "sacs-a-main", name: "Sacs à main" },
      { slug: "montres", name: "Montres" },
      { slug: "lunettes", name: "Lunettes" },
      { slug: "bijoux", name: "Bijoux" },
    ],
  },
];

export const CATEGORY_TREE: ParentCategory[] = TREE_DEF.map((p) => ({
  slug: p.slug,
  name: p.name,
  image: p.image,
  subs: p.subs.map((s) => ({ ...s, parentSlug: p.slug })),
}));

export const PARENT_CATEGORIES: ParentCategory[] = CATEGORY_TREE;
export const SUB_CATEGORIES: SubCategory[] = CATEGORY_TREE.flatMap((p) => p.subs);

// Pour compat avec l'ancien code (Categories grid, Footer, etc.)
export const CATEGORIES: { slug: string; name: string; count: string; image: string }[] =
  CATEGORY_TREE.map((p) => ({
    slug: p.slug,
    name: p.name,
    count: `${p.subs.length} catégories`,
    image: p.image,
  }));

export const NAV_LINKS = CATEGORY_TREE.map((p) => ({
  label: p.name,
  slug: p.slug,
  type: "category" as const,
}));

// ============================================================
// Helpers de résolution
// ============================================================

export function findParent(slug: string): ParentCategory | undefined {
  return PARENT_CATEGORIES.find((p) => p.slug === slug);
}

export function findSub(slug: string): SubCategory | undefined {
  return SUB_CATEGORIES.find((s) => s.slug === slug);
}

export type ResolvedCategory =
  | { kind: "parent"; slug: string; name: string; image: string; parent?: undefined }
  | {
      kind: "sub";
      slug: string;
      name: string;
      image: string;
      parent: { slug: string; name: string };
    };

export function findCategory(slug: string): ResolvedCategory | undefined {
  const parent = findParent(slug);
  if (parent) {
    return { kind: "parent", slug: parent.slug, name: parent.name, image: parent.image };
  }
  const sub = findSub(slug);
  if (sub) {
    const p = findParent(sub.parentSlug)!;
    return {
      kind: "sub",
      slug: sub.slug,
      name: sub.name,
      image: p.image,
      parent: { slug: p.slug, name: p.name },
    };
  }
  return undefined;
}

// ============================================================
// Produits — générés à partir de blueprints (déterministe)
// ============================================================

type Blueprint = {
  names: string[];
  brands: string[];
  images: string[];
  priceMin: number;
  priceMax: number;
};

const BP: Record<string, Blueprint> = {
  // Parfums & Fragrances
  parfums: {
    names: [
      "Eau de Parfum Intense 100ml",
      "Eau de Toilette Boisée 75ml",
      "Élixir Oud Royal 50ml",
      "Eau de Parfum Floral 100ml",
      "Parfum Ambré Signature 75ml",
    ],
    brands: ["Tom Ford", "YSL", "Dior", "Chanel"],
    images: [p3, perfumes, p6],
    priceMin: 380,
    priceMax: 1290,
  },
  "brumes-parfumees": {
    names: [
      "Brume Parfumée Vanille 200ml",
      "Brume Corps Fleur d'Oranger 250ml",
      "Mist Rose Délicate 150ml",
      "Brume Parfumée Monoï 200ml",
      "Voile Parfumé Jasmin 250ml",
    ],
    brands: ["YSL", "Dior", "Chanel", "Tom Ford"],
    images: [perfumes, p3],
    priceMin: 95,
    priceMax: 220,
  },
  "coffrets-parfum": {
    names: [
      "Coffret Découverte 4×15ml",
      "Coffret Signature Luxe",
      "Coffret Fête des Mères",
      "Coffret Voyage Trio",
      "Coffret Édition Limitée",
    ],
    brands: ["Tom Ford", "YSL", "Dior", "Chanel"],
    images: [perfumes, p3, p6],
    priceMin: 280,
    priceMax: 980,
  },

  // Maquillage
  teint: {
    names: [
      "Fond de Teint Liquide Éclat 30ml",
      "Poudre Compacte Matifiante",
      "BB Cream Hydratante SPF30",
      "Anti-cernes Couvrant",
      "Base Lissante Pré-Maquillage",
    ],
    brands: ["YSL", "Dior", "Chanel", "MAC"],
    images: [p6, cosmetics],
    priceMin: 110,
    priceMax: 380,
  },
  yeux: {
    names: [
      "Mascara Volume Extrême",
      "Palette Ombres à Paupières 12",
      "Eye-liner Précision Noir",
      "Crayon Khôl Intense",
      "Fard à Paupières Métallique",
    ],
    brands: ["YSL", "Dior", "Chanel", "MAC"],
    images: [p6, cosmetics],
    priceMin: 95,
    priceMax: 420,
  },
  levres: {
    names: [
      "Rouge à Lèvres Mat Couture",
      "Gloss Volumateur Brillance",
      "Crayon Contour Lèvres",
      "Baume Teinté Hydratant",
      "Encre Liquide Longue Tenue",
    ],
    brands: ["YSL", "Dior", "Chanel", "MAC"],
    images: [p6, cosmetics],
    priceMin: 90,
    priceMax: 280,
  },
  "accessoires-maquillage": {
    names: [
      "Set 12 Pinceaux Pro",
      "Éponge Beauté Précision",
      "Recourbe-Cils Premium",
      "Trousse Maquillage Cuir",
      "Miroir Lumineux LED",
    ],
    brands: ["MAC", "YSL", "Dior", "Chanel"],
    images: [cosmetics, p6],
    priceMin: 60,
    priceMax: 320,
  },

  // Soins du Visage
  nettoyants: {
    names: [
      "Mousse Nettoyante Douce 150ml",
      "Gel Purifiant Quotidien 200ml",
      "Eau Micellaire 400ml",
      "Huile Démaquillante 150ml",
      "Pâte Nettoyante Profonde",
    ],
    brands: ["La Mer", "Estée Lauder", "Clinique", "Lancôme"],
    images: [cosmetics, p6],
    priceMin: 120,
    priceMax: 420,
  },
  serums: {
    names: [
      "Sérum Vitamine C 30ml",
      "Sérum Acide Hyaluronique 30ml",
      "Sérum Rétinol Anti-âge",
      "Sérum Éclat Niacinamide",
      "Sérum Peptides Repulpant",
    ],
    brands: ["La Mer", "Estée Lauder", "Clinique", "Lancôme"],
    images: [cosmetics, p6],
    priceMin: 220,
    priceMax: 890,
  },
  "cremes-hydratantes": {
    names: [
      "Crème Hydratante 24h 50ml",
      "Crème Nuit Régénérante",
      "Gel Hydratant Aqua-Boost",
      "Crème Riche Nourrissante",
      "Émulsion Légère SPF15",
    ],
    brands: ["La Mer", "Estée Lauder", "Clinique", "Lancôme"],
    images: [cosmetics, p6],
    priceMin: 180,
    priceMax: 980,
  },
  masques: {
    names: [
      "Masque Argile Purifiant",
      "Masque Hydratant Tissu ×5",
      "Masque Éclat Vitamine C",
      "Masque Nuit Repulpant",
      "Masque Exfoliant Doux",
    ],
    brands: ["La Mer", "Estée Lauder", "Clinique", "Lancôme"],
    images: [cosmetics, p6],
    priceMin: 90,
    priceMax: 380,
  },
  "contour-yeux": {
    names: [
      "Contour des Yeux Anti-âge",
      "Patchs Yeux Or 60 pcs",
      "Sérum Contour Repulpant",
      "Crème Yeux Caféine",
      "Roller Contour Anti-Cernes",
    ],
    brands: ["La Mer", "Estée Lauder", "Clinique", "Lancôme"],
    images: [cosmetics, p6],
    priceMin: 140,
    priceMax: 690,
  },

  // Cheveux
  shampoings: {
    names: [
      "Shampoing Réparateur 250ml",
      "Shampoing Volumateur 300ml",
      "Shampoing Apaisant Cuir Chevelu",
      "Shampoing Anti-Pelliculaire",
      "Shampoing Couleur Protect 250ml",
    ],
    brands: ["Kérastase", "L'Oréal Professionnel", "Olaplex", "Redken"],
    images: [cosmetics, p3, p6],
    priceMin: 70,
    priceMax: 220,
  },
  "apres-shampoings": {
    names: [
      "Après-Shampoing Hydratant",
      "Après-Shampoing Démêlant",
      "Conditionneur Brillance",
      "Soin Lissant Anti-Frisottis",
      "Démêlant Sans Rinçage",
    ],
    brands: ["Kérastase", "L'Oréal Professionnel", "Olaplex", "Redken"],
    images: [cosmetics, p3, p6],
    priceMin: 75,
    priceMax: 210,
  },
  "masques-capillaires": {
    names: [
      "Masque Réparateur Intense",
      "Masque Nutrition Karité",
      "Masque Cheveux Colorés",
      "Masque Détox Argile",
      "Masque Lissant Kératine",
    ],
    brands: ["Kérastase", "L'Oréal Professionnel", "Olaplex", "Redken"],
    images: [cosmetics, p3, p6],
    priceMin: 95,
    priceMax: 280,
  },
  "huiles-serums": {
    names: [
      "Huile Sublimatrice 100ml",
      "Sérum Brillance Cheveux",
      "Huile Capillaire Argan",
      "Élixir Réparateur Pointes",
      "Huile Sèche Coiffante",
    ],
    brands: ["Kérastase", "L'Oréal Professionnel", "Olaplex", "Redken"],
    images: [cosmetics, p3, p6],
    priceMin: 110,
    priceMax: 320,
  },
  coiffage: {
    names: [
      "Spray Fixant Volume",
      "Mousse Coiffante Tenue Forte",
      "Cire Mate Texturisante",
      "Spray Thermo-Protecteur",
      "Gel Sculptant Brillance",
    ],
    brands: ["Kérastase", "L'Oréal Professionnel", "Olaplex", "Redken"],
    images: [cosmetics, p3, p6],
    priceMin: 65,
    priceMax: 190,
  },

  // Protection Solaire
  "solaires-visage": {
    names: [
      "Crème Solaire Visage SPF50+",
      "Fluide Solaire Invisible SPF50",
      "BB Solaire Teinté SPF30",
      "Crème Solaire Anti-Taches SPF50",
      "Stick Solaire Précision SPF50",
    ],
    brands: ["La Roche-Posay", "Avène", "Bioderma", "Vichy"],
    images: [cosmetics, p6],
    priceMin: 70,
    priceMax: 210,
  },
  "solaires-corps": {
    names: [
      "Lait Solaire Corps SPF30",
      "Spray Solaire Corps SPF50",
      "Brume Solaire Sèche SPF30",
      "Lait Solaire Enfant SPF50+",
      "Huile Solaire Sublimatrice SPF20",
    ],
    brands: ["La Roche-Posay", "Avène", "Bioderma", "Vichy"],
    images: [cosmetics, p6],
    priceMin: 65,
    priceMax: 180,
  },
  "apres-soleil": {
    names: [
      "Lait Après-Soleil Apaisant",
      "Gel Aloe Vera Réparateur",
      "Brume Après-Soleil Hydratante",
      "Lait Prolongateur de Bronzage",
      "Sérum Réparateur Post-Soleil",
    ],
    brands: ["La Roche-Posay", "Avène", "Bioderma", "Vichy"],
    images: [cosmetics, p6],
    priceMin: 55,
    priceMax: 160,
  },

  // Mode & Style
  "sacs-a-main": {
    names: [
      "Sac Cabas Cuir Lisse",
      "Pochette Soirée Strass",
      "Sac Bandoulière Matelassé",
      "Sac Tote Signature",
      "Mini Sac Crossbody",
      "Sac Hobo Cuir Grainé",
    ],
    brands: ["Cartier", "YSL", "Prada", "Gucci"],
    images: [bags, p4],
    priceMin: 890,
    priceMax: 4800,
  },
  montres: {
    names: [
      "Chronographe Acier Noir",
      "Montre Automatique Squelette",
      "Montre Or Rose Cuir",
      "Chronomaster Édition Or",
      "Montre Sport Caoutchouc",
      "Montre Classique Diamants",
    ],
    brands: ["Rolex", "Tissot", "Cartier", "Omega"],
    images: [watches, p1, p7],
    priceMin: 1800,
    priceMax: 18900,
  },
  lunettes: {
    names: [
      "Aviator Verres Dégradés",
      "Lunettes Carré Acétate",
      "Wayfarer Édition Limitée",
      "Pilote Titane Premium",
      "Lunettes Cat-Eye Femme",
      "Lunettes Rondes Vintage",
    ],
    brands: ["Ray-Ban", "Porsche Design", "Gucci", "Prada"],
    images: [sunglasses, p2, p8],
    priceMin: 380,
    priceMax: 1390,
  },
  bijoux: {
    names: [
      "Pendentif Diamant Solitaire",
      "Bague Or Rose Pavée",
      "Bracelet Tennis Diamants",
      "Boucles d'Oreilles Perles",
      "Collier Multi-Rangs Or",
      "Bracelet Jonc Signature",
    ],
    brands: ["Cartier", "Tiffany", "Bvlgari", "Swarovski"],
    images: [jewelry, p5],
    priceMin: 1200,
    priceMax: 12500,
  },
};

function buildProducts(): Product[] {
  const out: Product[] = [];
  for (const parent of CATEGORY_TREE) {
    for (const sub of parent.subs) {
      const bp = BP[sub.slug];
      if (!bp) continue;
      const n = bp.names.length;
      for (let i = 0; i < n; i++) {
        const brand = bp.brands[i % bp.brands.length];
        const image = bp.images[i % bp.images.length];
        const name = bp.names[i];
        // Prix déterministe entre min et max
        const t = n > 1 ? i / (n - 1) : 0.5;
        const basePrice = Math.round(bp.priceMin + (bp.priceMax - bp.priceMin) * t);
        // Arrondi propre
        const price = basePrice >= 1000 ? Math.round(basePrice / 50) * 50 : Math.round(basePrice / 5) * 5;

        // Badges déterministes en rotation
        let badge: Product["badge"] | undefined;
        let oldPrice: number | undefined;
        const cycle = i % 5;
        if (cycle === 0) {
          badge = "Best Seller";
        } else if (cycle === 1) {
          badge = "Nouveau";
        } else if (cycle === 2) {
          badge = "Promo";
          oldPrice = Math.round(price * 1.25);
          if (price >= 1000) oldPrice = Math.round(oldPrice / 50) * 50;
        }

        const ratingCycle = (i + sub.slug.length) % 5;
        const rating = 4.5 + ratingCycle * 0.1;

        const pSlug = slugify(`${brand}-${name}-${sub.slug}-${i}`);
        out.push({
          slug: pSlug,
          name,
          brand,
          category: sub.slug,
          price,
          oldPrice,
          image,
          badge,
          rating: Math.min(5, Number(rating.toFixed(1))),
          attributes: buildProductAttributes(pSlug, sub.slug, i),
        });
      }
    }
  }
  return out;
}

export const PRODUCTS: Product[] = buildProducts();

// ============================================================
// Sélecteurs produits
// ============================================================

export const findProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

// Retourne tous les produits d'une catégorie : parent → agrège tous ses subs.
export function productsByCategory(slug: string): Product[] {
  const parent = findParent(slug);
  if (parent) {
    const subSlugs = new Set(parent.subs.map((s) => s.slug));
    return PRODUCTS.filter((p) => subSlugs.has(p.category));
  }
  return PRODUCTS.filter((p) => p.category === slug);
}

export const findCategoryName = (slug: string): string => {
  const c = findCategory(slug);
  return c?.name ?? slug;
};

// ============================================================
// Sélections home
// ============================================================

export const BESTSELLERS: Product[] = PRODUCTS.filter((p) => p.badge === "Best Seller").slice(0, 4);
export const NEWARRIVALS: Product[] = PRODUCTS.filter((p) => p.badge === "Nouveau").slice(0, 4);

// ============================================================
// Marques
// ============================================================

export const TOP_BRANDS: { name: string; slug: string; tagline: string; image: string }[] = [
  { name: "Rolex", slug: slugify("Rolex"), tagline: "Horlogerie d'exception", image: watches },
  { name: "Cartier", slug: slugify("Cartier"), tagline: "Joaillerie & Maroquinerie", image: jewelry },
  { name: "Dior", slug: slugify("Dior"), tagline: "Couture & Beauté", image: p6 },
  { name: "Chanel", slug: slugify("Chanel"), tagline: "Élégance intemporelle", image: perfumes },
  { name: "Tom Ford", slug: slugify("Tom Ford"), tagline: "Parfums signature", image: p3 },
  { name: "YSL", slug: slugify("YSL"), tagline: "Audace Couture", image: p6 },
  { name: "Ray-Ban", slug: slugify("Ray-Ban"), tagline: "Icônes intemporelles", image: sunglasses },
];

export const findBrandBySlug = (slug: string): string | undefined => {
  const all = Array.from(new Set(PRODUCTS.map((p) => p.brand)));
  return all.find((b) => slugify(b) === slug);
};

export const productsByBrand = (slug: string) =>
  PRODUCTS.filter((p) => slugify(p.brand) === slug);

// ============================================================
// Recherche
// ============================================================

export function searchProducts(q: string, limit = 6): Product[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.brand.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      findCategoryName(p.category).toLowerCase().includes(s),
  ).slice(0, limit);
}
