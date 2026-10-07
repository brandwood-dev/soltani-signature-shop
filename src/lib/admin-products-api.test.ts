import { describe, expect, it } from "bun:test";

import { serializeAdminProductInput } from "./admin-product-payload";
import type { UpsertAdminProductInput } from "./admin-products-api";

describe("admin product payload serialization", () => {
  it("removes persisted image ids before sending a mutation", () => {
    const input = {
      name: "Produit audit",
      slug: "produit-audit",
      price: 100,
      stockQuantity: 1,
      category: "mode-style",
      section: "femme",
      status: "active",
      isFeatured: false,
      images: [
        {
          id: "image-id-from-api",
          url: "https://example.com/product.webp",
          variants: { w320: "https://example.com/product-w320.webp" },
          alt: "Produit audit",
        },
      ],
    } as unknown as UpsertAdminProductInput;

    expect(serializeAdminProductInput(input).images).toEqual([
      {
        url: "https://example.com/product.webp",
        variants: { w320: "https://example.com/product-w320.webp" },
        alt: "Produit audit",
      },
    ]);
  });
});
