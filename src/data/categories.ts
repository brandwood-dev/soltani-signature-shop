import bags from "@/assets/cat-bags.jpg";
import cosmetics from "@/assets/cat-cosmetics.jpg";
import perfumes from "@/assets/cat-perfumes.jpg";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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

const CATEGORY_DEFINITIONS = [
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
    slug: "soins-du-visage",
    name: "Soins du Visage",
    image: cosmetics,
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
    image: perfumes,
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
    image: cosmetics,
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
      { slug: "sacs", name: "Sacs" },
      { slug: "montres", name: "Montres" },
      { slug: "lunettes", name: "Lunettes" },
      { slug: "bijoux", name: "Bijoux" },
    ],
  },
] as const;

export const CATEGORY_TREE: ParentCategory[] = CATEGORY_DEFINITIONS.map(
  (category) => ({
    ...category,
    subs: category.subs.map((subcategory) => ({
      ...subcategory,
      parentSlug: category.slug,
    })),
  }),
);

const parentCategories = CATEGORY_TREE;
const subCategories = CATEGORY_TREE.flatMap((category) => category.subs);

export type ResolvedCategory =
  | {
      kind: "parent";
      slug: string;
      name: string;
      image: string;
      parent?: undefined;
    }
  | {
      kind: "sub";
      slug: string;
      name: string;
      image: string;
      parent: { slug: string; name: string };
    };

export function findCategory(slug: string): ResolvedCategory | undefined {
  const parent = parentCategories.find((category) => category.slug === slug);
  if (parent) {
    return {
      kind: "parent",
      slug: parent.slug,
      name: parent.name,
      image: parent.image,
    };
  }

  const subcategory = subCategories.find((category) => category.slug === slug);
  if (!subcategory) return undefined;

  const subcategoryParent = parentCategories.find(
    (category) => category.slug === subcategory.parentSlug,
  );
  if (!subcategoryParent) return undefined;

  return {
    kind: "sub",
    slug: subcategory.slug,
    name: subcategory.name,
    image: subcategoryParent.image,
    parent: {
      slug: subcategoryParent.slug,
      name: subcategoryParent.name,
    },
  };
}

export function findCategoryName(slug: string): string {
  return findCategory(slug)?.name ?? slug;
}
