import type { CategoryAttribute } from "@/lib/catalog-attributes-api";

const COLOR_ATTRIBUTE_KEYS = new Set(["color", "colour", "couleur", "teinte"]);

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isVariantManagedColorAttribute(association: CategoryAttribute) {
  const definition = association.attributeDefinition;
  return [definition.key, definition.label].some((value) =>
    COLOR_ATTRIBUTE_KEYS.has(normalizeKey(value)),
  );
}

export function sanitizeProductAttributeValues(
  values: Record<string, string[]>,
  associations: CategoryAttribute[],
) {
  const allowedKeys = new Set(
    associations.map((association) => normalizeKey(association.attributeDefinition.key)),
  );
  const sanitized: Record<string, string[]> = {};
  const ignoredKeys: string[] = [];

  for (const [key, entries] of Object.entries(values)) {
    if (!allowedKeys.has(normalizeKey(key))) {
      if (entries.some((value) => value.trim())) ignoredKeys.push(key);
      continue;
    }
    const cleaned = Array.from(new Set(entries.map((value) => value.trim()).filter(Boolean)));
    if (cleaned.length) sanitized[key] = cleaned;
  }

  return { values: sanitized, ignoredKeys: Array.from(new Set(ignoredKeys)) };
}

export function serializeConfiguredProductAttributes(
  values: Record<string, string[]>,
  associations: CategoryAttribute[],
) {
  const sanitized = sanitizeProductAttributeValues(values, associations).values;
  return Object.entries(sanitized).flatMap(([key, entries]) =>
    entries.map((value) => ({ key, value })),
  );
}
