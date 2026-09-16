import { describe, expect, test } from "bun:test";
import {
  getMetaPurchaseEventId,
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

  test("keeps only valid TND currency values", () => {
    expect(sanitizeMetaPixelParams({ value: 79, currency: " tnd " })).toEqual({
      value: 79,
      currency: "TND",
    });
    expect(sanitizeMetaPixelParams({ value: 79, currency: "EUR" })).toEqual({ value: 79 });
    expect(sanitizeMetaPixelParams({ currency: "" })).toBeUndefined();
  });
});
