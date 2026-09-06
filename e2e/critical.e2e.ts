import { expect, Page, test } from "@playwright/test";

const errorMessage = /Une erreur est survenue|Something went wrong/i;
const criticalRoutes = [
  "/",
  "/promotions",
  "/nouvelles-arrivees",
  "/meilleures-ventes",
  "/category/idees-cadeaux",
];

async function expectHealthyPage(page: Page, path: string) {
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];
  const baseOrigin = new URL(process.env.E2E_BASE_URL ?? "https://www.soltanisignature.com").origin;
  const onPageError = (error: Error) => pageErrors.push(error.message);
  const onResponse = (response: { url: () => string; status: () => number }) => {
    if (response.url().startsWith(baseOrigin) && response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  };

  page.on("pageerror", onPageError);
  page.on("response", onResponse);
  try {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${path} should return HTTP 200`).toBe(200);
    await expect(page.locator("body")).not.toContainText(errorMessage);
    expect(pageErrors, `${path} should not throw browser errors`).toEqual([]);
    expect(serverErrors, `${path} should not return server errors`).toEqual([]);
  } finally {
    page.off("pageerror", onPageError);
    page.off("response", onResponse);
  }
}

test.describe("critical public flows", () => {
  test("core storefront routes render without errors", async ({ page }) => {
    for (const path of criticalRoutes) {
      await expectHealthyPage(page, path);
    }
  });

  test("homepage product navigation opens a product detail", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const productLink = page.locator('a[href^="/product/"]').first();
    await expect(productLink).toBeVisible();

    await productLink.click();
    await expect(page).toHaveURL(/\/product\/[^/?#]+$/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(errorMessage);
  });

  test("admin pages protect unauthenticated visitors", async ({ page }) => {
    await page.goto("/admin/products", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByLabel("Email administrateur")).toBeVisible();
    await expect(page.locator("#admin-pwd")).toBeVisible();
  });

  test("cart page is reachable without creating an order", async ({ page }) => {
    const response = await page.goto("/cart", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(errorMessage);
  });

  test("production exposes a real Git SHA and healthy API", async ({ request }) => {
    const versionResponse = await request.get("/version.json");
    expect(versionResponse.status()).toBe(200);
    const version = await versionResponse.json();
    expect(version.service).toBe("soltani-signature-shop");
    expect(version.commit).toMatch(/^[0-9a-f]{40}$/i);

    const apiResponse = await request.get(
      `${process.env.E2E_API_BASE_URL ?? "https://soltani-signature-api.onrender.com"}/api/v1/health`,
    );
    expect(apiResponse.status()).toBe(200);
    expect((await apiResponse.json()).status).toBe("ok");
  });
});
