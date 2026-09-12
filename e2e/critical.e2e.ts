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

  test("checkout flow stays within a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "soltani-demo-payment",
        JSON.stringify({
          reference: "DEMO-MOBILE",
          amount: 250,
          subtotal: 240,
          shipping: 10,
          lines: [{ name: "Produit de démonstration au nom long", qty: 1, price: 240 }],
        }),
      );
      localStorage.setItem(
        "soltani-last-order",
        JSON.stringify({
          number: "SOL-20260912-00001",
          lines: [
            {
              id: "mobile-line",
              image: "",
              name: "Produit de démonstration au nom long",
              brand: "Marque de démonstration",
              variant: "Format standard",
              qty: 1,
              price: 240,
            },
          ],
          subtotal: 240,
          shipping: 10,
          discount: 0,
          total: 250,
          payment: "Paiement à la livraison",
          shippingMethod: "Livraison standard Tunisie",
          address: {
            name: "Client de démonstration",
            line: "Une adresse de livraison suffisamment longue pour tester le retour à la ligne",
            city: "Tunis",
            zip: "1000",
            phone: "+216 00 000 000",
          },
        }),
      );
    });

    for (const path of ["/cart", "/checkout", "/payment-demo", "/order-confirmation"]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${path} should return HTTP 200`).toBe(200);
      await expect(page.locator("body")).not.toContainText(errorMessage);
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          { message: `${path} should not overflow horizontally at 320px` },
        )
        .toBe(true);

      if (path === "/checkout") {
        const heading = page.getByRole("heading", { name: "Finaliser la commande" });
        const initialBox = await heading.boundingBox();
        await page.waitForTimeout(1_500);
        const settledBox = await heading.boundingBox();
        expect(initialBox, "checkout heading should be visible before async content settles").not.toBeNull();
        expect(settledBox, "checkout heading should remain visible after async content settles").not.toBeNull();
        expect(Math.abs((settledBox?.y ?? 0) - (initialBox?.y ?? 0))).toBeLessThanOrEqual(1);
      }
    }
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
