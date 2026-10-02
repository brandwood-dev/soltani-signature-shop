import { describe, expect, test } from "bun:test";
import {
  clearMetaGuestExternalId,
  getMetaExternalId,
  getMetaPurchaseEventId,
  normalizeMetaExternalId,
  normalizeMetaEmail,
  normalizeMetaPhone,
  sanitizeMetaPixelParams,
} from "./meta-pixel";

describe("Meta enhanced matching normalization", () => {
  test("normalizes email before hashing", () => {
    expect(normalizeMetaEmail("  Customer@Example.COM ")).toBe("customer@example.com");
    expect(normalizeMetaEmail("not-an-email")).toBeUndefined();
  });

  test("normalizes Tunisian phone numbers to digits with country code", () => {
    expect(normalizeMetaPhone("20 123 456")).toBe("21620123456");
    expect(normalizeMetaPhone("+216 20 123 456")).toBe("21620123456");
    expect(normalizeMetaPhone("123")).toBeUndefined();
  });

  test("keeps Purchase event IDs stable for the same order", () => {
    expect(getMetaPurchaseEventId("SOL-20260913-00001")).toBe("purchase:SOL-20260913-00001");
  });

  test("accepts stable authenticated and guest external IDs without control characters", () => {
    expect(normalizeMetaExternalId(" user-123 ")).toBe("user-123");
    expect(normalizeMetaExternalId("guest:123456")).toBe("guest:123456");
    expect(normalizeMetaExternalId("guest\n123456")).toBeUndefined();
    expect(normalizeMetaExternalId("x".repeat(129))).toBeUndefined();
  });

  test("persists a consented guest external ID and clears it when requested", () => {
    const previousWindow = (globalThis as typeof globalThis & { window?: unknown }).window;
    const previousDocument = (globalThis as typeof globalThis & { document?: unknown }).document;
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: storage },
    });
    Object.defineProperty(globalThis, "document", { configurable: true, value: {} });

    try {
      const first = getMetaExternalId(undefined, true);
      expect(first).toMatch(/^guest:/);
      expect(getMetaExternalId(undefined, true)).toBe(first);
      clearMetaGuestExternalId();
      expect(getMetaExternalId(undefined, true)).not.toBe(first);
    } finally {
      if (previousWindow === undefined) {
        Object.defineProperty(globalThis, "window", { configurable: true, value: undefined });
      }
      else Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
      if (previousDocument === undefined) {
        Object.defineProperty(globalThis, "document", { configurable: true, value: undefined });
      }
      else Object.defineProperty(globalThis, "document", { configurable: true, value: previousDocument });
    }
  });

  test("keeps only valid TND currency values", () => {
    expect(sanitizeMetaPixelParams({ value: 79, currency: " tnd " })).toEqual({
      value: 79,
      currency: "TND",
    });
    expect(sanitizeMetaPixelParams({ value: 79, currency: "EUR" })).toEqual({ value: 79 });
    expect(sanitizeMetaPixelParams({ currency: "" })).toBeUndefined();
  });
});
