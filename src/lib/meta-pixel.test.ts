import { describe, expect, test } from "bun:test";
import { normalizeMetaEmail, normalizeMetaPhone } from "./meta-pixel";

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
});
