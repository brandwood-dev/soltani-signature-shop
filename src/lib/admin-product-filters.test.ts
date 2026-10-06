import { describe, expect, it } from "bun:test";

import { flattenAdminCategoryOptions } from "./admin-product-filters";

describe("flattenAdminCategoryOptions", () => {
  it("keeps parent and child slugs while presenting a readable hierarchy", () => {
    expect(
      flattenAdminCategoryOptions([
        {
          name: "Mode & Style",
          slug: "mode-style",
          isActive: true,
          children: [
            {
              name: "Pantalon",
              slug: "pantalon",
              isActive: false,
            },
          ],
        },
      ]),
    ).toEqual([
      { value: "mode-style", label: "Mode & Style", isActive: true },
      { value: "pantalon", label: "Mode & Style → Pantalon", isActive: false },
    ]);
  });
});
