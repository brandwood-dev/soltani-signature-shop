import { describe, expect, it } from "bun:test";
import { responsiveImageSrcSet } from "./product-images";

describe("responsive product images", () => {
  it("builds a stable srcset from available variants", () => {
    expect(
      responsiveImageSrcSet({
        w320: "https://cdn.example.com/product-320.webp",
        w640: "https://cdn.example.com/product-640.webp",
        w1024: "https://cdn.example.com/product-1024.webp",
      }),
    ).toBe(
      "https://cdn.example.com/product-320.webp 320w, https://cdn.example.com/product-640.webp 640w, https://cdn.example.com/product-1024.webp 1024w",
    );
  });

  it("does not emit a srcset when legacy products have no variants", () => {
    expect(responsiveImageSrcSet()).toBeUndefined();
  });
});
