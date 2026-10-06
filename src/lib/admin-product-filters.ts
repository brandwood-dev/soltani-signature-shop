export type AdminCategoryRecord = {
  name: string;
  slug: string;
  isActive: boolean;
  children?: AdminCategoryRecord[];
};

export type AdminCategoryOption = {
  value: string;
  label: string;
  isActive: boolean;
};

export function flattenAdminCategoryOptions(categories: AdminCategoryRecord[]): AdminCategoryOption[] {
  return categories.flatMap((category) => [
    {
      value: category.slug,
      label: category.name,
      isActive: category.isActive,
    },
    ...(category.children ?? []).map((child) => ({
      value: child.slug,
      label: `${category.name} → ${child.name}`,
      isActive: child.isActive,
    })),
  ]);
}
