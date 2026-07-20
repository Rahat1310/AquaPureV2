import { test, expect } from "@playwright/test";

// ──────────────────────────────────────────────────────────────
// AquaPure Auth Smoke Tests (Clerk Option A)
// Run:  npx playwright test tests/auth.spec.ts
// Credential login E2E needs real Clerk users — covered manually / CI with secrets.
// ──────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Customer Auth UI", () => {
  test("customer sign-in page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await expect(page.locator("h1")).toContainText(/Sign in/i);
  });

  test("customer sign-up page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`);
    await expect(page.locator("h1")).toContainText(/Create your AquaPure account/i);
  });

  test("legacy /login redirects to /sign-in", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForURL("**/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Staff Auth UI", () => {
  test("admin sign-in page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/sign-in`);
    await expect(page.locator("h1")).toContainText(/Admin Portal/i);
  });

  test("legacy /admin/login redirects to /admin/sign-in", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForURL("**/admin/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/sign-in/);
  });
});

test.describe("Protected Route Guards", () => {
  test("unauthenticated user is redirected from /account to /sign-in", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/account`);
    await page.waitForURL("**/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("unauthenticated user is redirected from /dashboard to /sign-in", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL("**/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("unauthenticated user is redirected from /admin to /admin/sign-in", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForURL("**/admin/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/sign-in/);
  });
});
