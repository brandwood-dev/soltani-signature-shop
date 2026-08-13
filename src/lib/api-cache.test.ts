import { describe, expect, test } from "bun:test";
import { publicRequestCacheMode } from "./api";

describe("public API cache mode", () => {
  test("allows shared public catalog reads", () => {
    expect(publicRequestCacheMode("/catalog/products?page=1", "GET", false)).toBe("default");
  });

  test("keeps authenticated, preview and review requests private", () => {
    expect(publicRequestCacheMode("/catalog/products", "GET", true)).toBe("no-store");
    expect(publicRequestCacheMode("/products/preview/token", "GET", false)).toBe("no-store");
    expect(publicRequestCacheMode("/catalog/products/item/reviews", "GET", false)).toBe("no-store");
  });
});
