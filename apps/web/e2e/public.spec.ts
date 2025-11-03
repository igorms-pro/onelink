import { test, expect } from "@playwright/test";

test.describe("Public Profile", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("OneLink");
    await expect(page.locator("text=Share a single link")).toBeVisible();
  });

  test("settings modal opens and closes", async ({ page }) => {
    await page.goto("/");
    
    // Click settings icon
    const settingsButton = page.locator('button[aria-label="Settings"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // Modal should appear
    await expect(page.locator("text=Settings")).toBeVisible();
    await expect(page.locator("text=Theme")).toBeVisible();
    await expect(page.locator("text=Language")).toBeVisible();
    
    // Close modal
    await page.locator('button[aria-label="Close"]').click();
    await expect(page.locator("text=Settings")).not.toBeVisible();
  });

  test("theme can be changed", async ({ page }) => {
    await page.goto("/");
    
    // Open settings
    await page.locator('button[aria-label="Settings"]').click();
    
    // Change theme to dark
    const themeSelect = page.locator('select').first();
    await themeSelect.selectOption("dark");
    
    // Check that theme is applied (via data-theme attribute)
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("language can be changed", async ({ page }) => {
    await page.goto("/");
    
    // Open settings
    await page.locator('button[aria-label="Settings"]').click();
    
    // Change language to French
    const langSelect = page.locator('select').last();
    await langSelect.selectOption("fr");
    
    // Check that translation is applied
    await expect(page.locator("text=Se connecter")).toBeVisible(); // "Sign in" in French
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


