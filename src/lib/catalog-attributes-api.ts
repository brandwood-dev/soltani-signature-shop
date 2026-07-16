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

export async function getAdminAttributeDefinitions() {
  return apiFetch<AttributeDefinition[]>("/admin/attributes");
}

export async function createAdminAttributeDefinition(input: AttributeDefinitionInput) {
  const response = await apiFetch<{ definition: AttributeDefinition }>("/admin/attributes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.definition;
}

export async function updateAdminAttributeDefinition(
  id: string,
  input: Partial<AttributeDefinitionInput>,
) {
  const response = await apiFetch<{ definition: AttributeDefinition }>(`/admin/attributes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.definition;
}

export async function toggleAdminAttributeDefinition(id: string) {
  const response = await apiFetch<{ definition: AttributeDefinition }>(
    `/admin/attributes/${id}/toggle`,
    {
      method: "PATCH",
    },
  );
  return response.definition;
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
  return response.definitions;
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
  return response.option;
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
  return response.option;
}

export async function toggleAdminAttributeOption(definitionId: string, optionId: string) {
  const response = await apiFetch<{ option: AttributeOption }>(
    `/admin/attributes/${definitionId}/options/${optionId}/toggle`,
    { method: "PATCH" },
  );
  return response.option;
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
  return response.definitions;
}

export async function getAdminCategoryAttributes(categoryId: string) {
  return apiFetch<CategoryAttribute[]>(`/admin/categories/${categoryId}/attributes`);
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
  return response.association;
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
  return response.association;
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
  return response.attributes;
}

export async function getCatalogCategoryAttributes(slug: string) {
  return publicApiFetch<CategoryAttribute[]>(`/catalog/categories/${slug}/attributes`);
}
