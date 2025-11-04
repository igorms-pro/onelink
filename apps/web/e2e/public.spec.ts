import { test, expect } from "@playwright/test";

test.describe("Public Profile", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("OneLink");
    await expect(page.locator("text=Share a single link")).toBeVisible();
  });

  test("theme and language toggles are visible", async ({ page }) => {
    await page.goto("/");

    // Theme toggle should be visible
    const themeButton = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeButton).toBeVisible();

    // Language toggle should be visible
    const langButton = page.locator('button[aria-label="Change language"]');
    await expect(langButton).toBeVisible();
  });

  test("theme can be changed", async ({ page }) => {
    await page.goto("/");

    // Click theme toggle button
    const themeButton = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeButton).toBeVisible();

    // Get initial theme state
    const initialTheme = await page.locator("html").getAttribute("data-theme");

    // Click to toggle theme
    await themeButton.click();

    // Wait a moment for theme to apply
    await page.waitForTimeout(300);

    // Check that theme has changed (via data-theme attribute)
    const html = page.locator("html");
    const newTheme = await html.getAttribute("data-theme");
    expect(newTheme).not.toBe(initialTheme);
  });

  test("language can be changed", async ({ page }) => {
    await page.goto("/");

    // Click language toggle button
    const langButton = page.locator('button[aria-label="Change language"]');
    await expect(langButton).toBeVisible();
    await langButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(200);

    // Click French option from dropdown
    const frenchOption = page.locator('button:has-text("Français")');
    await expect(frenchOption).toBeVisible();
    await frenchOption.click();

    // Wait a moment for i18n to update
    await page.waitForTimeout(500);

    // Check that translation is applied (button text changes)
    await expect(page.locator('a:has-text("Se connecter")')).toBeVisible(); // "Sign in" in French
  });

  // Note: These tests require seeded data in Supabase
  // Uncomment when you have test data
  /*
  test("public profile page renders", async ({ page }) => {
    await page.goto("/test-slug");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("route link is clickable", async ({ page }) => {
    await page.goto("/test-slug");
    const link = page.locator('a:has-text("Book a Call")');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /.+/);
  });

  test("drop submission form works", async ({ page }) => {
    await page.goto("/test-slug");
    
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill("Test User");
    
    const fileInput = page.locator('input[name="files"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test content"),
    });
    
    await page.locator('button[type="submit"]').click();
    // Should show success message or redirect
  });
  */
});
