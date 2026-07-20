import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * RBAC + portal/admin walkthrough screenshots.
 * Credential flows need Clerk invited users — skipped until CLERK_E2E=1.
 * Run smoke redirects via: npx playwright test tests/auth.spec.ts
 */

const SHOT_DIR = path.join(process.cwd(), "docs", "walkthrough");

test.beforeAll(() => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
});

test.describe("Clerk route guards (no credentials)", () => {
  test("customer portal requires sign-in", async ({ page }) => {
    await page.goto("/account");
    await page.waitForURL("**/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin panel requires admin sign-in", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/sign-in**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/sign-in/);
  });
});

test.describe.skip("Customer Portal (requires Clerk customer session)", () => {
  test("placeholder — re-enable after Clerk E2E setup", async () => {
    // Invite/create rahela@example.com in Clerk, then restore login + screenshots.
  });
});

test.describe.skip("Admin RBAC by role (requires Clerk staff invites)", () => {
  test("placeholder — re-enable after inviting hardcoded staff emails", async () => {
    // Invite: superadmin@, admin@, service@, support@ aquapure.com.bd
    // Roles come from src/lib/staff-roles.ts
  });
});
