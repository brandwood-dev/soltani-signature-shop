import { describe, expect, test } from "bun:test";
import {
  buildUnifiedProductGallery,
  findContextualGalleryItem,
  getContextualGalleryAvailability,
} from "./product-gallery";

const product = {
  name: "Rouge test",
  image: "https://images.test/main.webp",
  gallery: ["https://images.test/main.webp", "https://images.test/detail.webp"],
  variantAxes: [
    {
      key: "couleur",
      label: "Couleur",
      sortOrder: 0,
      values: [
        {
          value: "rouge",
          label: "Rouge",
          imageUrl: "https://images.test/red.webp",
          sortOrder: 0,
        },
      ],
    },
  ],
  variants: [
    {
      id: "red-30",
      label: "Rouge / 30 ml",
      imageUrl: "https://images.test/red-30.webp",
      stockQuantity: 2,
      isActive: true,
      sortOrder: 0,
      selections: [
        { axisKey: "couleur", value: "rouge" },
        { axisKey: "contenance", value: "30-ml" },
      ],
    },
    {
      id: "red-100",
      label: "Rouge / 100 ml",
      imageUrl: "https://images.test/red.webp",
      stockQuantity: 0,
      isActive: true,
      sortOrder: 1,
      selections: [
        { axisKey: "couleur", value: "rouge" },
        { axisKey: "contenance", value: "100-ml" },
      ],
    },
    {
      id: "hidden",
      label: "Archivee",
      imageUrl: "https://images.test/hidden.webp",
      stockQuantity: 1,
      isActive: false,
      sortOrder: 2,
      selections: [{ axisKey: "couleur", value: "noir" }],
    },
  ],
};

describe("unified product gallery", () => {
  test("shows all active product and variation images once before selection", () => {
    const gallery = buildUnifiedProductGallery(product);

    expect(gallery.map((item) => item.url)).toEqual([
      "https://images.test/main.webp",
      "https://images.test/detail.webp",
      "https://images.test/red-30.webp",
      "https://images.test/red.webp",
    ]);
    expect(gallery.some((item) => item.url.includes("hidden"))).toBe(false);
    expect(gallery.find((item) => item.url.endsWith("red.webp"))?.associations).toHaveLength(2);
  });

  test("activates the exact variant image while preserving the full gallery", () => {
    const gallery = buildUnifiedProductGallery(product);

    expect(findContextualGalleryItem(gallery, product.variants[0])?.url).toBe(
      "https://images.test/red-30.webp",
    );
    expect(findContextualGalleryItem(gallery, undefined, { couleur: "rouge" })?.url).toBe(
      "https://images.test/red.webp",
    );
    expect(gallery).toHaveLength(4);
  });

  test("uses the selected variant availability for a shared image", () => {
    const gallery = buildUnifiedProductGallery(product);
    const sharedImage = gallery.find((item) => item.url.endsWith("red.webp"));

    expect(sharedImage?.available).toBe(true);
    expect(sharedImage && getContextualGalleryAvailability(sharedImage, product.variants[1])).toBe(
      false,
    );
  });
});
