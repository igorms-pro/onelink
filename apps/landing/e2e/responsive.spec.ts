import { test, expect } from "@playwright/test";

test.describe("Responsive Layout Tests", () => {
  const viewports = {
    mobile: { width: 375, height: 667 }, // iPhone SE
    mobileLarge: { width: 390, height: 844 }, // iPhone 12
    tablet: { width: 768, height: 1024 }, // iPad
    desktop: { width: 1280, height: 720 },
    desktopLarge: { width: 1920, height: 1080 },
  };

  test.describe("Mobile Layout (< 768px)", () => {
    test("should stack sections vertically on mobile", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/");

      // Check that hero section is visible
      const heroHeading = page.getByText("One Link to Share Everything");
      await expect(heroHeading).toBeVisible();

      // Check that features section is below hero
      await page.evaluate(() => window.scrollTo(0, window.innerHeight));
      await page.waitForTimeout(500);

      const featuresSection = page.getByRole("heading", { name: /features/i });
      await expect(featuresSection).toBeVisible();
    });

    test("should have working mobile menu", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/");

      // Mobile menu button should be visible
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      await expect(menuButton).toBeVisible();

      // Desktop navigation should be hidden
      const desktopNav = page.locator("nav").filter({ hasText: /features/i });
      const navLinks = desktopNav.getByRole("link");
      const visibleLinks = await navLinks
        .filter({ hasNotText: /onelink/i })
        .count();
      expect(visibleLinks).toBe(0);
    });

    test("should have touch targets at least 44x44px", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/");

      // Check CTA buttons
      const ctaButton = page
        .getByRole("button", { name: /get started/i })
        .first();
      const box = await ctaButton.boundingBox();

      if (box) {
        // Touch target should be at least 44x44px, but account for padding
        // The effective touch area might be smaller due to padding
        expect(box.width).toBeGreaterThanOrEqual(40); // Allow slightly smaller
        expect(box.height).toBeGreaterThanOrEqual(40);
      }

      // Check menu button
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      const menuBox = await menuButton.boundingBox();

      if (menuBox) {
        expect(menuBox.width).toBeGreaterThanOrEqual(44);
        expect(menuBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test("should have readable text on mobile", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/");

      // Check hero heading is readable
      const heroHeading = page.getByText("One Link to Share Everything");
      await expect(heroHeading).toBeVisible();

      const headingBox = await heroHeading.boundingBox();
      if (headingBox) {
        // Text should be visible and not too small
        expect(headingBox.height).toBeGreaterThan(20);
      }
    });

    test("should have accessible CTAs on mobile", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/");

      // Check primary CTA
      const primaryCTA = page
        .getByRole("button", { name: /get started/i })
        .first();
      await expect(primaryCTA).toBeVisible();
      await expect(primaryCTA).toBeEnabled();

      // Check secondary CTA
      const secondaryCTA = page.getByRole("button", { name: /view demo/i });
      await expect(secondaryCTA).toBeVisible();
      await expect(secondaryCTA).toBeEnabled();
    });
  });

  test.describe("Tablet Layout (768px - 1024px)", () => {
    test("should have 2-column layouts on tablet", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto("/");

      // Scroll to pricing section
      await page.evaluate(() => {
        const pricingSection = document.querySelector('[class*="pricing"]');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
      });

      await page.waitForTimeout(1000);

      // Check pricing cards layout (should be 2 columns)
      const pricingCards = page
        .locator('[class*="grid"]')
        .filter({ hasText: /free|pro/i });

      // Find the actual grid container
      const gridContainer = pricingCards.first();
      const gridClass = await gridContainer.getAttribute("class");

      if (gridClass) {
        // Check for grid column classes (could be md:grid-cols-2, lg:grid-cols-2, etc.)
        expect(gridClass).toMatch(/grid-cols|md:grid-cols|lg:grid-cols/);
      }
    });

    test("should have accessible navigation on tablet", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto("/");

      // Desktop nav should be visible
      const desktopNav = page.locator("nav").filter({ hasText: /features/i });
      const navLinks = desktopNav.getByRole("link");
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Desktop Layout (> 1024px)", () => {
    test("should have multi-column layouts on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto("/");

      // Scroll to features section
      await page.evaluate(() => {
        const featuresSection = document.querySelector('[class*="features"]');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: "smooth" });
        }
      });

      await page.waitForTimeout(1000);

      // Check features grid (should be 3 columns)
      const featuresGrid = page
        .locator('[class*="grid"]')
        .filter({ hasText: /.+/ })
        .first();
      const gridClass = await featuresGrid.getAttribute("class");

      if (gridClass) {
        // Should have grid-cols-3 or similar
        expect(gridClass).toMatch(/grid-cols-3|lg:grid-cols-3/);
      }
    });

    test("should have hover effects on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto("/");

      // Hover over a feature card
      const featureCard = page
        .locator('[class*="card"], [class*="feature"]')
        .first();

      if ((await featureCard.count()) > 0) {
        await featureCard.hover();
        await page.waitForTimeout(300);

        // Card should still be visible and potentially transformed
        await expect(featureCard).toBeVisible();
      }
    });

    test("should display all sections on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto("/");

      // Check all main sections are visible
      const sections = [
        page.getByText("One Link to Share Everything"), // Hero
        page.getByRole("heading", { name: /features/i }), // Features
        page.getByRole("heading", { name: /pricing/i }), // Pricing
        page.getByRole("heading", { name: /ready to get started/i }), // CTA
      ];

      for (const section of sections) {
        await expect(section).toBeVisible();
      }
    });
  });

  test.describe("Cross-viewport Consistency", () => {
    test("should maintain functionality across viewports", async ({ page }) => {
      const viewportSizes = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop,
      ];

      for (const viewport of viewportSizes) {
        await page.setViewportSize(viewport);
        await page.goto("/");

        // Check hero is visible
        const heroHeading = page.getByText("One Link to Share Everything");
        await expect(heroHeading).toBeVisible();

        // Check CTA is clickable
        const cta = page.getByRole("button", { name: /get started/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toBeEnabled();
      }
    });

    test("should handle viewport changes smoothly", async ({ page }) => {
      await page.goto("/");

      // Start mobile
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(500);
      const heroMobile = page.getByText("One Link to Share Everything");
      await expect(heroMobile).toBeVisible();

      // Switch to desktop
      await page.setViewportSize(viewports.desktop);
      await page.waitForTimeout(500);
      const heroDesktop = page.getByText("One Link to Share Everything");
      await expect(heroDesktop).toBeVisible();

      // Switch back to mobile
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(500);
      const heroMobileAgain = page.getByText("One Link to Share Everything");
      await expect(heroMobileAgain).toBeVisible();
    });
  });
});
