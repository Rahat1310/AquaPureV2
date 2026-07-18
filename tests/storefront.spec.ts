import { test, expect } from "@playwright/test";

// ──────────────────────────────────────────────────────────────
// AquaPure Storefront Smoke Tests
// Run:  npx playwright test tests/storefront.spec.ts
// ──────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000";

test.describe("Homepage", () => {
  test("loads with hero heading and featured products", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Featured purifiers.")).toBeVisible();
    // At least one product card links to a product detail page.
    await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
  });
});

test.describe("Category listing", () => {
  test("residential category loads with filters and sorting", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/residential`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Residential" }),
    ).toBeVisible();
    await expect(page.getByLabel("Sort products")).toBeVisible();
  });

  test("technology filter is applied server-side via the URL", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/residential`);
    // The visible desktop sidebar is the last filters instance in the DOM.
    // Use click (not check) because the checkbox state is driven by the URL.
    await page.getByRole("checkbox", { name: "RO" }).last().click();
    await page.waitForURL(/tech=ro/);
    await expect(page).toHaveURL(/tech=ro/);
  });
});

test.describe("Product detail", () => {
  test("loads gallery, purchase panel and tabs", async ({ page }) => {
    await page.goto(`${BASE_URL}/product/aquapure-ro-75-table-top`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Buy Now/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Specifications" }),
    ).toBeVisible();
  });
});

test.describe("Commercial Solutions", () => {
  test("loads tabs and opens the consultation form", async ({ page }) => {
    await page.goto(`${BASE_URL}/commercial-solutions`);
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("button", { name: "Get Consultation" }).click();
    await expect(
      page.getByRole("button", { name: "Request Consultation" }),
    ).toBeVisible();
  });
});
