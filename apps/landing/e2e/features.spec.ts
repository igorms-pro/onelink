import { test, expect } from "@playwright/test";

test.describe("Features Page Flow", () => {
  test("should load features page successfully", async ({ page }) => {
    await page.goto("/features");
    await expect(page).toHaveTitle(/Features/i);
    await expect(page).toHaveURL(/\/features/);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/features");

    // Check for hero heading
    const heroHeading = page
      .getByRole("heading", { name: /powerful features|features/i })
      .first();
    await expect(heroHeading).toBeVisible();

    // Check for hero description - use first() to handle duplicates
    const heroDescription = page.getByText(/everything you need/i).first();
    await expect(heroDescription).toBeVisible();
  });

  test("should display all 6 features", async ({ page }) => {
    await page.goto("/features");

    // Check for all 6 feature titles
    const features = [
      /one link|single link/i,
      /file sharing|file drop/i,
      /notification/i,
      /customizable|custom/i,
      /privacy/i,
      /analytics/i,
    ];

    for (const featurePattern of features) {
      const feature = page.getByText(featurePattern).first();
      await expect(feature).toBeVisible();
    }
  });

  test("should display FeaturesSection component", async ({ page }) => {
    await page.goto("/features");

    // Scroll to features section
    await page.evaluate(() => {
      const featuresSection = document.querySelector('[class*="features"]');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    });

    await page.waitForTimeout(1000);

    // Check for features grid
    const featuresGrid = page
      .locator('[class*="grid"]')
      .filter({ hasText: /.+/ })
      .first();
    await expect(featuresGrid).toBeVisible();
  });

  test("should display detailed feature sections", async ({ page }) => {
    await page.goto("/features");

    // Scroll down to see detailed features
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await page.waitForTimeout(1000);

    // Check for detailed feature content
    const detailedFeatures = page
      .locator('[class*="grid"]')
      .filter({ hasText: /.+/ });
    const count = await detailedFeatures.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display screenshot placeholders", async ({ page }) => {
    await page.goto("/features");

    // Scroll through the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1000);

    // Check for screenshot placeholders
    const placeholders = page.getByText(/SCREENSHOT/i);
    const count = await placeholders.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate back to homepage", async ({ page }) => {
    await page.goto("/features");

    // Click logo or home link
    const homeLink = page.getByRole("link", { name: /onelink/i }).first();
    await homeLink.click();

    await expect(page).toHaveURL("/");
    await expect(page).toHaveTitle(/One Link to Share Everything/i);
  });

  test("should have correct SEO meta tags", async ({ page }) => {
    await page.goto("/features");

    // Check title
    await expect(page).toHaveTitle(/Features/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });

  test("should have responsive layout", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/features");

    // Check that content is visible
    const heroHeading = page
      .getByRole("heading", { name: /powerful features|features/i })
      .first();
    await expect(heroHeading).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(heroHeading).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(heroHeading).toBeVisible();
  });

  test("should display feature icons", async ({ page }) => {
    await page.goto("/features");

    // Check for icons (SVG elements or icon components)
    const icons = page.locator("svg").filter({ hasText: "" });
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test("should display feature details lists", async ({ page }) => {
    await page.goto("/features");

    // Scroll to see feature details
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await page.waitForTimeout(1000);

    // Check for feature detail lists (ul elements with checkmarks)
    const detailLists = page.locator("ul").filter({ hasText: /.+/ });
    const count = await detailLists.count();
    expect(count).toBeGreaterThan(0);
  });
});
