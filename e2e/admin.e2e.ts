import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const apiBaseUrl = (() => {
  const value = (process.env.E2E_API_BASE_URL ?? "https://soltani-signature-api.onrender.com").replace(/\/+$/, "");
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
})();
const genericError = /Une erreur est survenue|Something went wrong/i;
const adminCredentialsConfigured = Boolean(adminEmail && adminPassword);

type AdminApiOptions = {
  method?: string;
  data?: unknown;
};

async function loginAdmin(page: Page) {
  if (!adminEmail || !adminPassword) {
    throw new Error("E2E_ADMIN_EMAIL et E2E_ADMIN_PASSWORD sont requis.");
  }

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator("#admin-email").fill(adminEmail);
  await page.locator("#admin-pwd").fill(adminPassword);
  await page.getByRole("button", { name: "Accéder au Backoffice" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 20_000 });
  await expect(page.locator("body")).not.toContainText(genericError);
}

async function getAccessToken(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("soltani-auth-session");
    if (!raw) return null;
    try {
      return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null;
    } catch {
      return null;
    }
  });
}

async function adminRequest(
  request: APIRequestContext,
  page: Page,
  path: string,
  options: AdminApiOptions = {},
) {
  const accessToken = await getAccessToken(page);
  if (!accessToken) throw new Error("Session admin absente du navigateur.");

  return request.fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    data: options.data,
    headers: {
      Accept: "application/json",
      ...(options.data === undefined ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function ignoreCleanupError(
  request: APIRequestContext,
  page: Page,
  path: string,
) {
  try {
    await adminRequest(request, page, path, { method: "DELETE" });
  } catch {
    return;
  }
}

function responseFor(page: Page, method: string, path: string) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === method && response.url().includes(`/api/v1${path}`),
  );
}

async function expectSuccessfulResponse(response: Awaited<ReturnType<Page["waitForResponse"]>>) {
  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);
  return response.json();
}

async function selectOption(page: Page, trigger: ReturnType<Page["locator"]>, label: string) {
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test.describe("authenticated admin flows", () => {
  test.skip(
    !adminCredentialsConfigured,
    "Suite activée uniquement avec E2E_ADMIN_EMAIL et E2E_ADMIN_PASSWORD.",
  );
  test.describe.configure({ mode: "serial" });

  test("admin can CRUD a category and a subcategory", async ({ page, request }) => {
    const suffix = `${Date.now()}-${test.info().workerIndex}`;
    const categoryName = `E2E QA catégorie ${suffix}`;
    const updatedCategoryName = `${categoryName} modifiée`;
    const subcategoryName = `E2E QA sous-catégorie ${suffix}`;
    let categoryId: string | undefined;
    let subcategoryId: string | undefined;

    try {
      await loginAdmin(page);
      await page.goto("/admin/categories", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Catégories" })).toBeVisible();

      await page.getByRole("button", { name: /Nouvelle categorie/i }).click();
      const createDialog = page.getByRole("dialog");
      await createDialog.locator("input").first().fill(categoryName);
      const createResponse = responseFor(page, "POST", "/admin/categories");
      await createDialog.getByRole("button", { name: "Enregistrer" }).click();
      categoryId = (await expectSuccessfulResponse(await createResponse)).category.id;
      await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

      let categoryRow = page.locator("li").filter({ hasText: categoryName }).first();
      await categoryRow.locator("button").nth(5).click();
      const editDialog = page.getByRole("dialog");
      await editDialog.locator("input").first().fill(updatedCategoryName);
      const updateResponse = responseFor(page, "PATCH", `/admin/categories/${categoryId}`);
      await editDialog.getByRole("button", { name: "Enregistrer" }).click();
      await expectSuccessfulResponse(await updateResponse);
      await expect(page.getByText(updatedCategoryName, { exact: true })).toBeVisible();

      categoryRow = page.locator("li").filter({ hasText: updatedCategoryName }).first();
      const toggleResponse = responseFor(page, "PATCH", `/admin/categories/${categoryId}/toggle`);
      await categoryRow.locator("button").nth(4).click();
      await expectSuccessfulResponse(await toggleResponse);
      await expect(categoryRow.getByText("Inactive", { exact: true })).toBeVisible();

      const reactivateResponse = responseFor(page, "PATCH", `/admin/categories/${categoryId}/toggle`);
      await categoryRow.locator("button").nth(4).click();
      await expectSuccessfulResponse(await reactivateResponse);
      await expect(categoryRow.getByText("Inactive", { exact: true })).toHaveCount(0);

      await categoryRow
        .getByRole("button", { name: `Ajouter une sous-catégorie à ${updatedCategoryName}` })
        .click();
      const subcategoryDialog = page.getByRole("dialog");
      await subcategoryDialog.locator("input").first().fill(subcategoryName);
      const createSubcategoryResponse = responseFor(page, "POST", "/admin/categories");
      await subcategoryDialog.getByRole("button", { name: "Enregistrer" }).click();
      subcategoryId = (await expectSuccessfulResponse(await createSubcategoryResponse)).category.id;

      categoryRow = page.locator("li").filter({ hasText: updatedCategoryName }).first();
      if ((await page.getByText(subcategoryName, { exact: true }).count()) === 0) {
        await categoryRow.getByRole("button", { name: "Déplier" }).click();
      }
      await expect(page.getByText(subcategoryName, { exact: true })).toBeVisible();

      const subcategoryRow = page
        .getByText(subcategoryName, { exact: true })
        .locator("xpath=ancestor::li[1]");
      page.once("dialog", (dialog) => dialog.accept());
      const deleteSubcategoryResponse = responseFor(page, "DELETE", `/admin/categories/${subcategoryId}`);
      await subcategoryRow.locator("button").last().click();
      await expectSuccessfulResponse(await deleteSubcategoryResponse);
      subcategoryId = undefined;
      await expect(page.getByText(subcategoryName, { exact: true })).toHaveCount(0);

      categoryRow = page.locator("li").filter({ hasText: updatedCategoryName }).first();
      page.once("dialog", (dialog) => dialog.accept());
      const deleteCategoryResponse = responseFor(page, "DELETE", `/admin/categories/${categoryId}`);
      await categoryRow.locator("button").last().click();
      await expectSuccessfulResponse(await deleteCategoryResponse);
      categoryId = undefined;
      await expect(page.getByText(updatedCategoryName, { exact: true })).toHaveCount(0);
    } finally {
      if (subcategoryId) await ignoreCleanupError(request, page, `/admin/categories/${subcategoryId}`);
      if (categoryId) await ignoreCleanupError(request, page, `/admin/categories/${categoryId}`);
    }
  });

  test("admin can create, edit, and delete a product", async ({ page, request }) => {
    const suffix = `${Date.now()}-${test.info().workerIndex}`;
    const productName = `E2E QA produit ${suffix}`;
    const updatedProductName = `${productName} modifié`;
    let productId: string | undefined;

    try {
      await loginAdmin(page);
      const categoriesResponse = await adminRequest(request, page, "/admin/categories");
      expect(categoriesResponse.status()).toBe(200);
      const categoriesBody = (await categoriesResponse.json()) as {
        categories: Array<{ id: string; name: string; slug: string; isActive: boolean; parentId: string | null }>;
      };
      const category = categoriesBody.categories.find(
        (item) => item.isActive && item.parentId === null && item.slug !== "idees-cadeaux",
      );
      expect(category, "Une catégorie active non-cadeau est requise").toBeTruthy();

      const brandsResponse = await adminRequest(request, page, "/admin/featured-brands");
      expect(brandsResponse.status()).toBe(200);
      const brandsBody = (await brandsResponse.json()) as {
        brands: Array<{ name: string; active: boolean }>;
      };
      const brand = brandsBody.brands.find((item) => item.active && item.name.trim());
      expect(brand, "Une marque active est requise").toBeTruthy();

      await page.goto("/admin/products/new", { waitUntil: "domcontentloaded" });
      await page.getByLabel("Nom du produit *").fill(productName);
      await page.getByLabel("Prix de vente (DT) *").fill("1");
      await page.locator("#stock").fill("1");

      const comboboxes = page.locator('[role="combobox"]');
      await selectOption(page, comboboxes.nth(2), category!.name);
      await selectOption(page, comboboxes.last(), brand!.name);
      await expect(page.getByRole("button", { name: "Enregistrer" }).first()).toBeEnabled({ timeout: 20_000 });

      const createResponse = responseFor(page, "POST", "/products/admin");
      await page.getByRole("button", { name: "Enregistrer" }).first().click();
      productId = (await expectSuccessfulResponse(await createResponse)).product.id;
      await expect(page).toHaveURL(/\/admin\/products\/?$/);
      await expect(page.getByText(productName, { exact: true }).last()).toBeVisible();

      await page.goto(`/admin/products/${productId}/edit`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#name")).toHaveValue(productName);
      await page.locator("#name").fill(updatedProductName);
      const updateResponse = responseFor(page, "PATCH", `/products/admin/${productId}`);
      await page.getByRole("button", { name: "Enregistrer" }).first().click();
      await expectSuccessfulResponse(await updateResponse);
      await expect(page).toHaveURL(/\/admin\/products\/?$/);
      await expect(page.getByText(updatedProductName, { exact: true }).last()).toBeVisible();

      const productRow = page.locator("tr").filter({ hasText: updatedProductName }).first();
      await productRow.getByRole("button").last().click();
      page.once("dialog", (dialog) => dialog.accept());
      const deleteResponse = responseFor(page, "DELETE", `/products/admin/${productId}`);
      await page.getByRole("menuitem", { name: "Supprimer", exact: true }).click();
      await expectSuccessfulResponse(await deleteResponse);
      productId = undefined;
      await expect(page.getByText(updatedProductName, { exact: true })).toHaveCount(0);
    } finally {
      if (productId) await ignoreCleanupError(request, page, `/products/admin/${productId}`);
    }
  });

  test("admin can open the orders list and inspect an order", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/orders", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Commandes" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(genericError);

    const orderLink = page.locator('a[href^="/admin/orders/"]').last();
    if ((await orderLink.count()) === 0) {
      await expect(page.getByText("Aucune commande.", { exact: true })).toBeVisible();
      return;
    }

    await orderLink.click();
    await expect(page).toHaveURL(/\/admin\/orders\/[^/?#]+$/);
    await expect(page.getByText("Statut", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Mettre à jour" })).toBeVisible();
  });

  test("admin can update and restore a dedicated test order", async ({ page, request }) => {
    test.skip(
      !process.env.E2E_ADMIN_ORDER_ID || process.env.E2E_ADMIN_ORDER_MUTATION !== "true",
      "Mutation activée uniquement avec une commande de test dédiée.",
    );

    await loginAdmin(page);
    const orderId = process.env.E2E_ADMIN_ORDER_ID!;
    const currentResponse = await adminRequest(request, page, `/orders/admin/${orderId}`);
    expect(currentResponse.status()).toBe(200);
    const currentBody = (await currentResponse.json()) as { order: { status: string } };
    const initialStatus = currentBody.order.status;
    const targetStatus = initialStatus === "pending" ? "processing" : "pending";

    try {
      await page.goto(`/admin/orders/${orderId}`, { waitUntil: "domcontentloaded" });
      const statusSelect = page.locator('[role="combobox"]').first();
      await selectOption(
        page,
        statusSelect,
        targetStatus === "processing" ? "En préparation" : "En attente",
      );
      const updateResponse = responseFor(page, "PATCH", `/orders/admin/${orderId}/status`);
      await page.getByRole("button", { name: "Mettre à jour" }).click();
      await expectSuccessfulResponse(await updateResponse);
    } finally {
      await adminRequest(request, page, `/orders/admin/${orderId}/status`, {
        method: "PATCH",
        data: { status: initialStatus },
      });
    }
  });
});
