import { CATEGORY_TREE, type ParentCategory, slugify } from "@/data/catalog";
import { apiFetch } from "@/lib/api";

export type ApiCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: ApiCategory[];
};

export type CategoryTree = ParentCategory & {
  id: string;
  active: boolean;
  imageUrl: string | null;
  sortOrder: number;
  subs: Array<ParentCategory["subs"][number] & {
    id: string;
    active: boolean;
    imageUrl: string | null;
    sortOrder: number;
  }>;
};

export type AdminCategoryInput = {
  name?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export async function getCatalogCategories() {
  const categories = await apiFetch<ApiCategory[]>("/catalog/categories");
  return categories;
}

export async function getAdminCategories() {
  const response = await apiFetch<{ categories: ApiCategory[] }>("/admin/categories");
  return response.categories;
}

export async function updateAdminCategory(id: string, input: AdminCategoryInput) {
  const response = await apiFetch<{ category: ApiCategory }>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.category;
}

export async function toggleAdminCategory(id: string) {
  const response = await apiFetch<{ category: ApiCategory }>(`/admin/categories/${id}/toggle`, {
    method: "PATCH",
  });
  return response.category;
}

export async function reorderAdminCategories(ids: string[]) {
  const response = await apiFetch<{ categories: ApiCategory[] }>("/admin/categories/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  return response.categories;
}

export function toCategoryTree(categories: ApiCategory[]): CategoryTree[] {
  return categories.map((category) => {
    const fallback = CATEGORY_TREE.find((item) => item.slug === category.slug);
    const image = category.imageUrl || fallback?.image || CATEGORY_TREE[0]?.image || "/placeholder.svg";

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      image,
      imageUrl: category.imageUrl,
      active: category.isActive,
      sortOrder: category.sortOrder,
      subs: (category.children ?? []).map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        parentSlug: category.slug,
        active: child.isActive,
        imageUrl: child.imageUrl,
        sortOrder: child.sortOrder,
      })),
    };
  });
}

export function fallbackCategoryTree(): CategoryTree[] {
  return CATEGORY_TREE.map((category, sortOrder) => ({
    ...category,
    id: category.slug,
    active: true,
    imageUrl: null,
    sortOrder,
    subs: category.subs.map((sub, index) => ({
      ...sub,
      id: sub.slug,
      active: true,
      imageUrl: null,
      sortOrder: index,
    })),
  }));
}

export async function loadCategoryTree({ admin = false } = {}) {
  const categories = admin ? await getAdminCategories() : await getCatalogCategories();
  return toCategoryTree(categories);
}

export function findInCategoryTree(slug: string, tree: CategoryTree[]) {
  const parent = tree.find((category) => category.slug === slug);
  if (parent) {
    return {
      kind: "parent" as const,
      slug: parent.slug,
      name: parent.name,
      image: parent.image,
    };
  }

  for (const category of tree) {
    const sub = category.subs.find((item) => item.slug === slug);
    if (sub) {
      return {
        kind: "sub" as const,
        slug: sub.slug,
        name: sub.name,
        image: category.image,
        parent: { slug: category.slug, name: category.name },
      };
    }
  }

  return undefined;
}

export function findParentInTree(slug: string, tree: CategoryTree[]) {
  return tree.find((category) => category.slug === slug || category.subs.some((sub) => sub.slug === slug));
}

export function generatedCategorySlug(name: string) {
  return slugify(name);
}
