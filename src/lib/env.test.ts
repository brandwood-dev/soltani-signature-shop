import { describe, expect, test } from "bun:test";
import { resolvePublicApiUrl } from "./env";

describe("public API URL", () => {
  test("replaces the decommissioned Vercel backend", () => {
    expect(resolvePublicApiUrl("https://soltani-signature-api.vercel.app/api/v1")).toBe(
      "https://soltani-signature-api.onrender.com/api/v1",
    );
  });

  test("preserves a valid custom API URL without a trailing slash", () => {
    expect(resolvePublicApiUrl("https://api.example.com/api/v1/")).toBe(
      "https://api.example.com/api/v1",
    );
  });
});
