import type {
  AdminProductVariant,
  AdminProductVariantAxis,
  AdminProductVariantOptionValue,
} from "@/lib/admin-products-api";

export const VARIANT_AXIS_TEMPLATES = [
  { key: "color", label: "Couleur", displayType: "swatch" as const },
  { key: "taille", label: "Taille", displayType: "button" as const },
  { key: "contenance", label: "Contenance", displayType: "button" as const },
  { key: "pointure", label: "Pointure", displayType: "button" as const },
  { key: "matiere", label: "Matière", displayType: "select" as const },
  { key: "custom", label: "Option personnalisée", displayType: "button" as const },
];

export function slugifyVariantValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeVariantValue(
  label = "",
  colorHex: string | null = null,
): AdminProductVariantOptionValue {
  return {
    value: slugifyVariantValue(label),
    label,
    code: null,
    colorHex,
    imageUrl: null,
    isActive: true,
    sortOrder: 0,
  };
}

export function makeVariantAxis(
  templateKey: string,
  existingAxes: AdminProductVariantAxis[] = [],
): AdminProductVariantAxis {
  const template =
    VARIANT_AXIS_TEMPLATES.find((item) => item.key === templateKey) ??
    VARIANT_AXIS_TEMPLATES.at(-1)!;
  const customIndex = existingAxes.filter((axis) => axis.key.startsWith("option-")).length + 1;
  const key = template.key === "custom" ? `option-${customIndex}` : template.key;
  return {
    key,
    label: template.label,
    displayType: template.displayType,
    isActive: true,
    sortOrder: existingAxes.length,
    values: [makeVariantValue("", template.displayType === "swatch" ? "#C47A7A" : null)],
  };
}

export function makeColorVariant(
  price = 0,
  stockQuantity = 0,
  lowStockThreshold = 5,
): AdminProductVariant {
  return {
    sku: "",
    label: "",
    reference: "",
    colorHex: "#C47A7A",
    imageUrl: "",
    price,
    stockQuantity,
    lowStockThreshold,
    isActive: true,
    isDefault: false,
    sortOrder: 0,
    selections: [],
  };
}

export function normalizeLegacyColorConfiguration(variants: AdminProductVariant[]) {
  const values = variants.map((variant, index) => ({
    id: variant.selections?.[0]?.valueId,
    value:
      variant.selections?.[0]?.value ||
      (variant.id ? `legacy-${variant.id}` : `teinte-${index + 1}`),
    label: variant.label,
    code: variant.reference,
    colorHex: variant.colorHex || "#C47A7A",
    imageUrl: variant.imageUrl,
    isActive: variant.isActive,
    sortOrder: index,
  }));
  const axis: AdminProductVariantAxis = {
    id: variants[0]?.selections?.[0]?.axisId,
    key: "color",
    label: "Couleur",
    displayType: "swatch",
    isActive: true,
    sortOrder: 0,
    values,
  };
  return {
    axes: [axis],
    variants: variants.map((variant, index) => ({
      ...variant,
      selections: [{ axisKey: "color", value: values[index].value }],
    })),
  };
}

export function variantCombinationKey(selections: Array<{ axisKey: string; value: string }> = []) {
  return selections.map((selection) => `${selection.axisKey}=${selection.value}`).join("|");
}

export function variantCombinationCount(axes: AdminProductVariantAxis[]) {
  const activeAxes = axes.filter((axis) => axis.isActive);
  if (!activeAxes.length) return 0;
  return activeAxes.reduce(
    (count, axis) => count * axis.values.filter((value) => value.isActive).length,
    1,
  );
}

export function generateVariantCombinations(
  axes: AdminProductVariantAxis[],
  existingVariants: AdminProductVariant[],
  defaults: { price: number; stockQuantity: number; lowStockThreshold: number },
) {
  const activeAxes = axes.filter((axis) => axis.isActive);
  if (
    !activeAxes.length ||
    activeAxes.some((axis) => !axis.values.some((value) => value.isActive))
  ) {
    return [];
  }

  const combinations = activeAxes.reduce<AdminProductVariantOptionValue[][]>(
    (current, axis) =>
      current.flatMap((combination) =>
        axis.values.filter((value) => value.isActive).map((value) => [...combination, value]),
      ),
    [[]],
  );
  const existingByKey = new Map(
    existingVariants.map((variant) => [variantCombinationKey(variant.selections), variant]),
  );

  return combinations.map((values, index) => {
    const selections = values.map((value, axisIndex) => ({
      axisKey: activeAxes[axisIndex].key,
      value: value.value || slugifyVariantValue(value.label),
    }));
    const current = existingByKey.get(variantCombinationKey(selections));
    const swatchIndex = activeAxes.findIndex((axis) => axis.displayType === "swatch");
    const reference = values.find((value) => value.code)?.code ?? null;
    return {
      id: current?.id,
      sku: current?.sku ?? "",
      label: values.map((value) => value.label).join(" / "),
      reference,
      colorHex: swatchIndex >= 0 ? values[swatchIndex]?.colorHex : null,
      imageUrl: current?.imageUrl ?? values.find((value) => value.imageUrl)?.imageUrl ?? null,
      price: current?.price ?? defaults.price,
      stockQuantity: current?.stockQuantity ?? defaults.stockQuantity,
      lowStockThreshold: current?.lowStockThreshold ?? defaults.lowStockThreshold,
      isActive: current?.isActive ?? true,
      isDefault: current?.isDefault ?? index === 0,
      sortOrder: index,
      selections,
    } satisfies AdminProductVariant;
  });
}
