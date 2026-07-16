import { apiFetch, publicApiFetch } from "@/lib/api";

export type AttributeType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "MULTI_SELECT";

export type AttributeOption = {
  id: string;
  definitionId: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export type AttributeDefinition = {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  sortOrder: number;
  isActive: boolean;
  options: AttributeOption[];
};

export type CategoryAttribute = {
  id: string;
  categoryId: string;
  attributeDefinitionId: string;
  required: boolean;
  filterable: boolean;
  sortOrder: number;
  attributeDefinition: AttributeDefinition;
};

export type AttributeDefinitionInput = {
  key: string;
  label: string;
  type: AttributeType;
  sortOrder?: number;
  isActive?: boolean;
};

export type AttributeOptionInput = {
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type CategoryAttributeInput = {
  attributeDefinitionId: string;
  required?: boolean;
  filterable?: boolean;
  sortOrder?: number;
};

type AttributeDefinitionsResponse = AttributeDefinition[] | { definitions?: AttributeDefinition[] };
type CategoryAttributesResponse = CategoryAttribute[] | { attributes?: CategoryAttribute[] };

const ATTRIBUTE_TYPES: AttributeType[] = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT"];

function isAttributeType(value: unknown): value is AttributeType {
  return typeof value === "string" && ATTRIBUTE_TYPES.includes(value as AttributeType);
}

function normalizeOption(option: Partial<AttributeOption> | null | undefined): AttributeOption {
  return {
    id: String(option?.id ?? ""),
    definitionId: String(option?.definitionId ?? ""),
    value: String(option?.value ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    sortOrder: Number(option?.sortOrder ?? 0),
    isActive: option?.isActive ?? true,
  };
}

function normalizeDefinition(
  definition: Partial<AttributeDefinition> | null | undefined,
): AttributeDefinition {
  return {
    id: String(definition?.id ?? ""),
    key: String(definition?.key ?? ""),
    label: String(definition?.label ?? definition?.key ?? ""),
    type: isAttributeType(definition?.type) ? definition.type : "TEXT",
    sortOrder: Number(definition?.sortOrder ?? 0),
    isActive: definition?.isActive ?? true,
    options: Array.isArray(definition?.options) ? definition.options.map(normalizeOption) : [],
  };
}

function normalizeCategoryAttribute(
  association: Partial<CategoryAttribute> | null | undefined,
): CategoryAttribute {
  const definition = normalizeDefinition(association?.attributeDefinition);

  return {
    id: String(association?.id ?? ""),
    categoryId: String(association?.categoryId ?? ""),
    attributeDefinitionId: String(association?.attributeDefinitionId ?? definition.id),
    required: association?.required ?? false,
    filterable: association?.filterable ?? true,
    sortOrder: Number(association?.sortOrder ?? 0),
    attributeDefinition: definition,
  };
}

function normalizeDefinitions(response: AttributeDefinitionsResponse) {
  const definitions = Array.isArray(response) ? response : response.definitions;
  return Array.isArray(definitions) ? definitions.map(normalizeDefinition) : [];
}

function normalizeCategoryAttributes(response: CategoryAttributesResponse) {
  const attributes = Array.isArray(response) ? response : response.attributes;
  return Array.isArray(attributes) ? attributes.map(normalizeCategoryAttribute) : [];
}

export async function getAdminAttributeDefinitions() {
  const response = await apiFetch<AttributeDefinitionsResponse>("/admin/attributes");
  return normalizeDefinitions(response);
}

export async function createAdminAttributeDefinition(input: AttributeDefinitionInput) {
  const response = await apiFetch<{ definition: AttributeDefinition }>("/admin/attributes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return normalizeDefinition(response.definition);
}

export async function updateAdminAttributeDefinition(
  id: string,
  input: Partial<AttributeDefinitionInput>,
) {
  const response = await apiFetch<{ definition: AttributeDefinition }>(`/admin/attributes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return normalizeDefinition(response.definition);
}

export async function toggleAdminAttributeDefinition(id: string) {
  const response = await apiFetch<{ definition: AttributeDefinition }>(
    `/admin/attributes/${id}/toggle`,
    {
      method: "PATCH",
    },
  );
  return normalizeDefinition(response.definition);
}

export async function deleteAdminAttributeDefinition(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/attributes/${id}`, { method: "DELETE" });
}

export async function reorderAdminAttributeDefinitions(ids: string[]) {
  const response = await apiFetch<{ definitions: AttributeDefinition[] }>(
    "/admin/attributes/reorder",
    {
      method: "PUT",
      body: JSON.stringify({ ids }),
    },
  );
  return normalizeDefinitions(response);
}

export async function createAdminAttributeOption(
  definitionId: string,
  input: AttributeOptionInput,
) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attributes/${definitionId}/options`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return normalizeOption(response.option);
}

export async function updateAdminAttributeOption(
  definitionId: string,
  optionId: string,
  input: Partial<AttributeOptionInput>,
) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attributes/${definitionId}/options/${optionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return normalizeOption(response.option);
}

export async function toggleAdminAttributeOption(definitionId: string, optionId: string) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attributes/${definitionId}/options/${optionId}/toggle`,
    { method: "PATCH" },
  );
  return normalizeOption(response.option);
}

export async function deleteAdminAttributeOption(definitionId: string, optionId: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/attributes/${definitionId}/options/${optionId}`, {
    method: "DELETE",
  });
}

export async function reorderAdminAttributeOptions(definitionId: string, ids: string[]) {
  const response = await apiFetch<{ definitions: AttributeDefinition[] }>(
    `/admin/attributes/${definitionId}/options/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ ids }),
    },
  );
  return normalizeDefinitions(response);
}

export async function getAdminCategoryAttributes(categoryId: string) {
  const response = await apiFetch<CategoryAttributesResponse>(
    `/admin/categories/${categoryId}/attributes`,
  );
  return normalizeCategoryAttributes(response);
}

export async function assignAdminCategoryAttribute(
  categoryId: string,
  input: CategoryAttributeInput,
) {
  const response = await apiFetch<{ association: CategoryAttribute }>(
    `/admin/categories/${categoryId}/attributes`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return normalizeCategoryAttribute(response.association);
}

export async function updateAdminCategoryAttribute(
  categoryId: string,
  associationId: string,
  input: Omit<Partial<CategoryAttributeInput>, "attributeDefinitionId">,
) {
  const response = await apiFetch<{ association: CategoryAttribute }>(
    `/admin/categories/${categoryId}/attributes/${associationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return normalizeCategoryAttribute(response.association);
}

export async function deleteAdminCategoryAttribute(categoryId: string, associationId: string) {
  return apiFetch<{ deleted: boolean }>(
    `/admin/categories/${categoryId}/attributes/${associationId}`,
    {
      method: "DELETE",
    },
  );
}

export async function reorderAdminCategoryAttributes(categoryId: string, ids: string[]) {
  const response = await apiFetch<{ attributes: CategoryAttribute[] }>(
    `/admin/categories/${categoryId}/attributes/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ ids }),
    },
  );
  return normalizeCategoryAttributes(response);
}

export async function getCatalogCategoryAttributes(slug: string) {
  const response = await publicApiFetch<CategoryAttributesResponse>(
    `/catalog/categories/${slug}/attributes`,
  );
  return normalizeCategoryAttributes(response);
}
