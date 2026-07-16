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
  categoryCount: number;
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

export type AttributeDefinitionsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AttributeDefinitionsPage = {
  definitions: AttributeDefinition[];
  pagination: AttributeDefinitionsPagination;
};

export type AttributeDefinitionsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
};

type AttributeDefinitionsResponse =
  | AttributeDefinition[]
  | {
      definitions?: AttributeDefinition[];
      pagination?: Partial<AttributeDefinitionsPagination>;
    };
type CategoryAttributesResponse = CategoryAttribute[] | { attributes?: CategoryAttribute[] };

const ATTRIBUTE_TYPES: AttributeType[] = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown, field: string, context: string) {
  if (typeof value === "string" && value.trim()) return value;
  throw new Error(`Réponse API invalide pour ${context} : champ "${field}" manquant.`);
}

function isAttributeType(value: unknown): value is AttributeType {
  return typeof value === "string" && ATTRIBUTE_TYPES.includes(value as AttributeType);
}

function normalizeOption(option: unknown): AttributeOption {
  if (!isRecord(option)) {
    throw new Error("Réponse API invalide pour option : objet manquant.");
  }

  return {
    id: requiredString(option.id, "id", "option"),
    definitionId: requiredString(option.definitionId, "definitionId", "option"),
    value: requiredString(option.value, "value", "option"),
    label: requiredString(option.label, "label", "option"),
    sortOrder: Number(option.sortOrder ?? 0),
    isActive: option.isActive !== false,
  };
}

function normalizeDefinition(definition: unknown): AttributeDefinition {
  if (!isRecord(definition)) {
    throw new Error("Réponse API invalide pour attribut : objet manquant.");
  }
  if (!isAttributeType(definition.type)) {
    throw new Error("Réponse API invalide pour attribut : type non supporté.");
  }
  const count = isRecord(definition._count) ? definition._count.categories : undefined;

  return {
    id: requiredString(definition.id, "id", "attribut"),
    key: requiredString(definition.key, "key", "attribut"),
    label: requiredString(definition.label, "label", "attribut"),
    type: definition.type,
    sortOrder: Number(definition.sortOrder ?? 0),
    isActive: definition.isActive !== false,
    options: Array.isArray(definition.options) ? definition.options.map(normalizeOption) : [],
    categoryCount: Number(definition.categoryCount ?? count ?? 0),
  };
}

function normalizeCategoryAttribute(association: unknown): CategoryAttribute {
  if (!isRecord(association)) {
    throw new Error("Réponse API invalide pour association : objet manquant.");
  }
  const definition = normalizeDefinition(association.attributeDefinition);

  return {
    id: requiredString(association.id, "id", "association"),
    categoryId: requiredString(association.categoryId, "categoryId", "association"),
    attributeDefinitionId: requiredString(
      association.attributeDefinitionId ?? definition.id,
      "attributeDefinitionId",
      "association",
    ),
    required: association.required === true,
    filterable: association.filterable !== false,
    sortOrder: Number(association.sortOrder ?? 0),
    attributeDefinition: definition,
  };
}

function normalizeDefinitions(response: AttributeDefinitionsResponse) {
  const definitions = Array.isArray(response) ? response : response.definitions;
  return Array.isArray(definitions) ? definitions.map(normalizeDefinition) : [];
}

function normalizeDefinitionsPage(
  response: AttributeDefinitionsResponse,
): AttributeDefinitionsPage {
  const definitions = normalizeDefinitions(response);
  const pagination = Array.isArray(response) ? undefined : response.pagination;
  return {
    definitions,
    pagination: {
      page: Number(pagination?.page ?? 1),
      pageSize: Number(pagination?.pageSize ?? (definitions.length || 8)),
      total: Number(pagination?.total ?? definitions.length),
      totalPages: Number(pagination?.totalPages ?? 1),
    },
  };
}

function normalizeCategoryAttributes(response: CategoryAttributesResponse) {
  const attributes = Array.isArray(response) ? response : response.attributes;
  return Array.isArray(attributes) ? attributes.map(normalizeCategoryAttribute) : [];
}

export async function getAdminAttributeDefinitions() {
  const response = await apiFetch<AttributeDefinitionsResponse>("/admin/attributes");
  return normalizeDefinitions(response);
}

export async function getAdminAttributeDefinitionsPage(query: AttributeDefinitionsQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sort) params.set("sort", query.sort);
  const suffix = params.toString() ? `?${params}` : "";
  const response = await apiFetch<AttributeDefinitionsResponse>(`/admin/attributes${suffix}`);
  return normalizeDefinitionsPage(response);
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
  const response = await apiFetch<{ option: AttributeOption }>("/admin/attribute-options", {
    method: "POST",
    body: JSON.stringify({ definitionId, ...input }),
  });
  return normalizeOption(response.option);
}

export async function updateAdminAttributeOption(
  _definitionId: string,
  optionId: string,
  input: Partial<AttributeOptionInput>,
) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attribute-options/${optionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return normalizeOption(response.option);
}

export async function toggleAdminAttributeOption(_definitionId: string, optionId: string) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attribute-options/${optionId}/toggle`,
    { method: "PATCH" },
  );
  return normalizeOption(response.option);
}

export async function deleteAdminAttributeOption(_definitionId: string, optionId: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/attribute-options/${optionId}`, {
    method: "DELETE",
  });
}

export async function reorderAdminAttributeOptions(definitionId: string, ids: string[]) {
  const response = await apiFetch<{ definitions: AttributeDefinition[] }>(
    "/admin/attribute-options/reorder",
    {
      method: "PUT",
      body: JSON.stringify({ definitionId, ids }),
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
    "/admin/category-attributes",
    {
      method: "POST",
      body: JSON.stringify({ categoryId, ...input }),
    },
  );
  return normalizeCategoryAttribute(response.association);
}

export async function updateAdminCategoryAttribute(
  _categoryId: string,
  associationId: string,
  input: Omit<Partial<CategoryAttributeInput>, "attributeDefinitionId">,
) {
  const response = await apiFetch<{ association: CategoryAttribute }>(
    `/admin/category-attributes/${associationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return normalizeCategoryAttribute(response.association);
}

export async function deleteAdminCategoryAttribute(_categoryId: string, associationId: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/category-attributes/${associationId}`, {
    method: "DELETE",
  });
}

export async function reorderAdminCategoryAttributes(categoryId: string, ids: string[]) {
  const response = await apiFetch<{ attributes: CategoryAttribute[] }>(
    "/admin/category-attributes/reorder",
    {
      method: "PUT",
      body: JSON.stringify({ categoryId, ids }),
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
