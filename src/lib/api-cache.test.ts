import { describe, expect, test } from "bun:test";
import { apiRetryPolicy, publicRequestCacheMode } from "./api";

describe("public API cache mode", () => {
  test("allows shared public catalog reads", () => {
    expect(publicRequestCacheMode("/catalog/products?page=1", "GET", false)).toBe("default");
    expect(publicRequestCacheMode("/content/hero", "GET", false)).toBe("default");
    expect(publicRequestCacheMode("/content/settings", "GET", false)).toBe("default");
  });

  test("keeps authenticated, preview and review requests private", () => {
    expect(publicRequestCacheMode("/catalog/products", "GET", true)).toBe("no-store");
    expect(publicRequestCacheMode("/products/preview/token", "GET", false)).toBe("no-store");
    expect(publicRequestCacheMode("/catalog/products/item/reviews", "GET", false)).toBe("no-store");
  });

  test("omits Request.cache during SSR for Cloudflare compatibility", () => {
    expect(publicRequestCacheMode("/catalog/products", "GET", false, false)).toBeUndefined();
    expect(publicRequestCacheMode("/content/hero", "GET", false, false)).toBeUndefined();
  });
});

describe("API retry policy", () => {
  test("returns SSR quickly so the browser can recover a cold backend", () => {
    expect(apiRetryPolicy("/catalog/products", "GET", false)).toEqual({
      attempts: 1,
      timeoutMs: 8_000,
    });
  });

  test("gives public browser reads enough time to wake Render", () => {
    expect(apiRetryPolicy("/catalog/products", "GET", true)).toEqual({
      attempts: 2,
      timeoutMs: 20_000,
    });
    expect(apiRetryPolicy("/orders", "POST", true)).toEqual({
      attempts: 1,
      timeoutMs: 15_000,
    });
  });
});
