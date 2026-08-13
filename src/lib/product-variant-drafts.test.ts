import { describe, expect, test } from "bun:test";
import {
  generateVariantCombinations,
  getActiveVariantPriceSummary,
  makeVariantAxis,
  variantCombinationCount,
} from "./product-variant-drafts";

describe("product variant drafts", () => {
  test("generates every active combination with independent prices", () => {
    const color = makeVariantAxis("color");
    color.values = [
      { ...color.values[0], value: "rouge", label: "Rouge" },
      { ...color.values[0], value: "rose", label: "Rose", sortOrder: 1 },
    ];
    const size = makeVariantAxis("contenance", [color]);
    size.values = [
      { ...size.values[0], value: "30-ml", label: "30 ml" },
      { ...size.values[0], value: "100-ml", label: "100 ml", sortOrder: 1 },
    ];

    const variants = generateVariantCombinations([color, size], [], {
      price: 49,
      stockQuantity: 10,
      lowStockThreshold: 2,
    });

    expect(variantCombinationCount([color, size])).toBe(4);
    expect(variants).toHaveLength(4);
    expect(variants.every((variant) => variant.price === 49)).toBe(true);
  });

  test("summarizes only active variant prices", () => {
    const size = makeVariantAxis("taille");
    const makeVariant = (price: number) =>
      generateVariantCombinations([size], [], {
        price,
        stockQuantity: 1,
        lowStockThreshold: 1,
      })[0];
    const variants = [
      { ...makeVariant(30), price: 30 },
      { ...makeVariant(80), price: 80, isActive: false },
    ];
    expect(getActiveVariantPriceSummary(variants)).toMatchObject({
      min: 30,
      max: 30,
      count: 1,
    });
  });
});
