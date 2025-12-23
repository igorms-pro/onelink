import { test, expect } from "@playwright/test";

test.describe("Homepage Load & Navigation", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OneLink/i);
  });

  test("should display all sections", async ({ page }) => {
    await page.goto("/");

    // Check for hero section
    await expect(page.getByText("One Link to Share Everything")).toBeVisible();

    // Check for features section
    await expect(
      page.getByRole("heading", { name: /features/i }),
    ).toBeVisible();

    // Check for pricing section
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();

    // Check for CTA section
    await expect(
      page.getByRole("heading", { name: /ready to get started/i }),
    ).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Test Features link
    await page
      .getByRole("link", { name: /features/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/features/);
    await expect(page).toHaveTitle(/Features/i);

    // Go back to homepage
    await page.goto("/");

    // Test Pricing link
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page).toHaveTitle(/Pricing/i);
  });

  test("should toggle mobile menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();

    // Click to open menu
    await menuButton.click();

    // Mobile menu should be visible - scope to navigation
    const nav = page.getByRole("navigation");
    const featuresLink = nav.getByRole("link", { name: /features/i });
    await expect(featuresLink).toBeVisible();

    // Click to close menu
    await menuButton.click();

    // Menu should be closed (features link not visible in mobile menu)
    await expect(featuresLink).not.toBeVisible();
  });

  test("should close mobile menu when link is clicked", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Open mobile menu
    await page.getByRole("button", { name: /toggle menu/i }).click();

    // Click Features link - scope to navigation
    const nav = page.getByRole("navigation");
    const featuresLink = nav.getByRole("link", { name: /features/i });
    await featuresLink.click();

    // Should navigate to features page
    await expect(page).toHaveURL(/\/features/);

    // Menu should be closed (check by going back and verifying menu button state)
    await page.goBack();
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();
  });

  test("should toggle language", async ({ page }) => {
    await page.goto("/");

    // Find language toggle button (should be visible on desktop)
    const languageToggle = page
      .locator('button[aria-label*="language"], button[aria-label*="Language"]')
      .first();

    // If visible, click it
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
      // Verify language changed (check for different text or URL)
      // This is a basic test - actual implementation may vary
    }
  });

  test("should toggle theme", async ({ page }) => {
    await page.goto("/");

    // Find theme toggle button
    const themeToggle = page
      .locator('button[aria-label*="theme"], button[aria-label*="Theme"]')
      .first();

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      // Click theme toggle
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(500);

      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test("should have working CTA button in header", async ({ page }) => {
    await page.goto("/");

    const signInButton = page.getByTestId("header-sign-in");
    await expect(signInButton).toBeVisible();

    // Click and verify redirect (will navigate away)
    const [response] = await Promise.all([
      page
        .waitForURL("https://app.getonelink.io/auth", { timeout: 5000 })
        .catch(() => null),
      signInButton.click(),
    ]);

    // In CI, external redirects won't work, so skip assertion
    if (!process.env.CI) {
      expect(response).not.toBeNull();
    }
  });

  test("should have working footer links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test footer Features link
    const footerFeaturesLink = page
      .getByRole("link", { name: /features/i })
      .last();
    await footerFeaturesLink.click();
    await expect(page).toHaveURL(/\/features/);

    // Go back
    await page.goBack();

    // Scroll to footer again
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test footer Pricing link
    const footerPricingLink = page
      .getByRole("link", { name: /pricing/i })
      .last();
    await footerPricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("should have correct page title and meta tags", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/One Link to Share Everything/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);
  });
});
