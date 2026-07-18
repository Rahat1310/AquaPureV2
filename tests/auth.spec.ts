import { test, expect } from "@playwright/test";

// ──────────────────────────────────────────────────────────────
// AquaPure Auth Smoke Tests
// Run:  npx playwright test tests/auth.spec.ts
// ──────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000";

test.describe("Customer Auth Flow", () => {
  test("customer login page loads with h1", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("customer can sign in with seeded credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[id="email"]', "rahela@example.com");
    await page.fill('[id="password"]', "Customer@123");
    await page.click('[id="sign-in-btn"]');
    // After successful login, customer should be redirected to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("wrong password is rejected on customer login", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[id="email"]', "rahela@example.com");
    await page.fill('[id="password"]', "WrongPassword!");
    await page.click('[id="sign-in-btn"]');
    // Should stay on login page with error
    await page.waitForURL(`${BASE_URL}/login**`, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Staff Auth Flow", () => {
  test("staff login page loads with h1", async ({ page }) => {
    await page.goto(`${BASE_URL}/staff/login`);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("staff can sign in with admin credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/staff/login`);
    await page.fill('[id="email"]', "admin@aquapure.com.bd");
    await page.fill('[id="password"]', "Admin@123456");
    await page.click('[id="staff-sign-in-btn"]');
    // After successful staff login, should redirect to /admin
    await page.waitForURL("**/admin**", { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test("customer cannot use staff login path", async ({ page }) => {
    await page.goto(`${BASE_URL}/staff/login`);
    await page.fill('[id="email"]', "rahela@example.com");
    await page.fill('[id="password"]', "Customer@123");
    await page.click('[id="staff-sign-in-btn"]');
    // Should stay on staff login with error (customer role blocked)
    await page.waitForURL(`${BASE_URL}/staff/login**`, { timeout: 5000 });
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});

test.describe("Protected Route Guards", () => {
  test("unauthenticated user is redirected from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL("**/login**", { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from /admin to /staff/login", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForURL("**/staff/login**", { timeout: 5000 });
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});
