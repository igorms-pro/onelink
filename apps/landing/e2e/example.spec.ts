import { test, expect } from "@playwright/test";

test.describe("Landing Page - Example E2E Test", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OneLink/i);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    // Check for hero headline
    await expect(page.getByText("One Link to Share Everything")).toBeVisible();
  });

  test("should have working CTA buttons", async ({ page }) => {
    await page.goto("/");
    // Check primary CTA exists
    const primaryCTA = page.getByRole("button", { name: /get started free/i });
    await expect(primaryCTA).toBeVisible();
  });
});
