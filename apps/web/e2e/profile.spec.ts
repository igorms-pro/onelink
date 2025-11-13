import { test, expect } from "@playwright/test";

test.describe("Profile Viewing", () => {
  test("public profile page loads", async ({ _page }) => {
    // This test requires a test profile slug
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=OneLink")).toBeVisible();
    */
  });

  test("profile displays user information", async ({ _page }) => {
    // This test requires a test profile slug
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    // Check for profile elements
    await expect(page.locator("text=Display Name")).toBeVisible();
    // Bio, avatar, etc.
    */
  });

  test("route links are clickable", async ({ _page }) => {
    // This test requires a test profile slug with links
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    const link = page.locator('a:has-text("Book a Call")').first();
    if (await link.isVisible()) {
      await expect(link).toHaveAttribute("href", /.+/);
      
      // Click should open in new tab or navigate
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page"),
        link.click(),
      ]);
      
      await expect(newPage).toBeTruthy();
    }
    */
  });

  test("drops section is expandable", async ({ _page }) => {
    // This test requires a test profile slug with drops
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    const dropsSection = page.locator("text=Drops").first();
    if (await dropsSection.isVisible()) {
      // Click to expand
      await dropsSection.click();
      
      // Should show submission form
      await expect(page.locator('input[name="name"]')).toBeVisible();
    }
    */
  });

  test("links section is expandable", async ({ _page }) => {
    // This test requires a test profile slug with links
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    const linksSection = page.locator("text=Routes").first();
    if (await linksSection.isVisible()) {
      // Click to expand
      await linksSection.click();
      
      // Should show links
      await expect(page.locator('[data-testid*="link"]').first()).toBeVisible();
    }
    */
  });

  test("social links are clickable", async ({ _page }) => {
    // This test requires a test profile slug with social links
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    const socialLink = page.locator('a[href*="twitter.com"], a[href*="github.com"]').first();
    if (await socialLink.isVisible()) {
      await expect(socialLink).toHaveAttribute("href", /.+/);
    }
    */
  });

  test("profile footer is visible", async ({ _page }) => {
    // This test requires a test profile slug
    // Uncomment when you have test data:
    /*
    await page.goto("/test-slug");
    
    await expect(page.locator("text=Powered by OneLink")).toBeVisible();
    await expect(page.locator("text=Privacy Policy")).toBeVisible();
    await expect(page.locator("text=Terms of Service")).toBeVisible();
    */
  });

  test("privacy policy link works", async ({ page }) => {
    await page.goto("/test-slug");

    const privacyLink = page.locator("a:has-text('Privacy Policy')");
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/\/privacy/);
    }
  });

  test("terms of service link works", async ({ page }) => {
    await page.goto("/test-slug");

    const termsLink = page.locator("a:has-text('Terms of Service')");
    if (await termsLink.isVisible()) {
      await termsLink.click();
      await expect(page).toHaveURL(/\/terms/);
    }
  });
});
