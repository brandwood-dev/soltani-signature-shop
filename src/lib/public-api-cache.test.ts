import { describe, expect, test } from "bun:test";
import { publicApiCacheKey, publicApiCachePolicy } from "./public-api-cache";

describe("Cloudflare public API cache policy", () => {
  test("caches only anonymous public catalog and content reads", () => {
    expect(publicApiCachePolicy("GET", "/api/v1/catalog/products", false)).toEqual({
      freshSeconds: 30,
      staleSeconds: 3_600,
      tag: "public-catalog",
    });
    expect(publicApiCachePolicy("GET", "/api/v1/content/hero", false)).toEqual({
      freshSeconds: 300,
      staleSeconds: 86_400,
      tag: "public-content",
    });
  });

  test("never caches private, mutable, preview or review requests", () => {
    expect(publicApiCachePolicy("GET", "/api/v1/catalog/products", true)).toBeNull();
    expect(publicApiCachePolicy("POST", "/api/v1/catalog/products", false)).toBeNull();
    expect(publicApiCachePolicy("GET", "/api/v1/catalog/products/item/reviews", false)).toBeNull();
    expect(publicApiCachePolicy("GET", "/api/v1/products/preview/token", false)).toBeNull();
    expect(publicApiCachePolicy("GET", "/api/v1/admin/products", false)).toBeNull();
  });

  test("separates fresh and stale entries while preserving the query", () => {
    const source = "https://www.soltanisignature.com/api/v1/catalog/products?featured=1";
    expect(publicApiCacheKey(source, "fresh").url).toBe(
      "https://www.soltanisignature.com/api/v1/catalog/products?featured=1&__soltani_edge_cache=fresh",
    );
    expect(publicApiCacheKey(source, "stale").url).toBe(
      "https://www.soltanisignature.com/api/v1/catalog/products?featured=1&__soltani_edge_cache=stale",
    );
  });
});
