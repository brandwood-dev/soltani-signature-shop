import type {
  AdminProductMutationPayload,
  UpsertAdminProductInput,
} from "./admin-products-api";

export function serializeAdminProductInput(
  input: UpsertAdminProductInput,
): AdminProductMutationPayload {
  return {
    ...input,
    images: input.images?.map(({ url, variants, alt }) => ({ url, variants, alt })),
    variants: input.variants?.map((variant) => ({
      ...variant,
      selections: variant.selections?.map(({ axisKey, value }) => ({ axisKey, value })),
    })),
  };
}
