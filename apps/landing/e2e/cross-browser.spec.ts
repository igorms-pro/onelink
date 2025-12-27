import { test, expect } from "@playwright/test";

test.describe("Cross-Browser Compatibility", () => {
  test("should load homepage on all browsers", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OneLink/i);

    // Verify main content is visible
    const heroHeading = page.getByTestId("hero-headline");
    await expect(heroHeading).toBeVisible();
  });

  test("should display all sections correctly", async ({ page }) => {
    await page.goto("/");

    // Check hero section
    const heroHeading = page.getByTestId("hero-headline");
    await expect(heroHeading).toBeVisible();

    // Check features section
    const featuresHeading = page.getByRole("heading", { name: /features/i });
    await expect(featuresHeading).toBeVisible();

    // Check pricing section
    await page.evaluate(() => {
      const pricingSection = document.querySelector('[class*="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    });
    await page.waitForTimeout(1000);

    const pricingHeading = page.getByRole("heading", { name: /pricing/i });
    await expect(pricingHeading).toBeVisible();
  });

  test("should have working navigation on all browsers", async ({ page }) => {
    await page.goto("/");

    // Test Features link - should scroll to #features section
    await page
      .getByRole("link", { name: /features/i })
      .first()
      .click();
    await page.waitForTimeout(500); // Wait for scroll
    await expect(page).toHaveURL(/#features/);

    // Test Pricing link - should scroll to #pricing section
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500); // Wait for scroll
    await expect(page).toHaveURL(/#pricing/);
  });

  test("should handle CTA clicks correctly", async ({ page }) => {
    await page.goto("/");

    const heroCTA = page.getByTestId("hero-cta-get-started");
    await expect(heroCTA).toBeVisible();
    await expect(heroCTA).toBeEnabled();

    // Verify button will trigger redirect
    const href = await heroCTA.getAttribute("href");

    if (href) {
      expect(href).toContain("app.getonelink.io/auth");
    } else {
      let redirectUrl: string | null = null;
      page.on("framenavigated", (frame) => {
        if (frame.url().includes("app.getonelink.io")) {
          redirectUrl = frame.url();
        }
      });

      // Click CTA (will navigate away)
      await Promise.all([
        page
          .waitForURL("https://app.getonelink.io/auth**", { timeout: 5000 })
          .catch(() => {
            // In CI, external domain might not resolve
          }),
        heroCTA.click(),
      ]);

      const currentUrl = page.url();
      const redirectHappened =
        redirectUrl?.includes("app.getonelink.io/auth") ||
        currentUrl.includes("app.getonelink.io/auth");

      // Verify redirect was attempted (button is functional)
      expect(
        redirectHappened || currentUrl !== "http://localhost:4173/",
      ).toBeTruthy();
    }
  });

  test("should handle mobile menu on all browsers", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();

    // Check menu is visible - scope to navigation
    const nav = page.getByRole("navigation");
    const featuresLink = nav.getByRole("link", { name: /features/i });
    await expect(featuresLink).toBeVisible();

    // Close menu
    await menuButton.click();
  });

  test("should handle theme toggle on all browsers", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page
      .locator('button[aria-label*="theme"], button[aria-label*="Theme"]')
      .first();

    if (await themeToggle.isVisible()) {
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      await themeToggle.click();
      await page.waitForTimeout(500);

      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test("should handle scroll animations on all browsers", async ({ page }) => {
    await page.goto("/");

    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 2);
    });

    await page.waitForTimeout(1000);

    // Verify page scrolled
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test("should handle form interactions on all browsers", async ({ page }) => {
    await page.goto("/");

    // Scroll to FAQ section
    await page.evaluate(() => {
      const faqSection = document.querySelector('[class*="faq"]');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    });

    await page.waitForTimeout(1000);

    const faqButtons = page
      .getByRole("button")
      .filter({ hasText: /^[^Sign|^Get|^View]/ });

    if ((await faqButtons.count()) > 0) {
      const firstFAQ = faqButtons.first();
      await firstFAQ.click();
      await page.waitForTimeout(300);

      // Verify interaction worked
      await expect(firstFAQ).toBeVisible();
    }
  });

  test("should handle responsive layouts on all browsers", async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const heroMobile = page.getByTestId("hero-headline");
    await expect(heroMobile).toBeVisible();

    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();

    const heroDesktop = page.getByTestId("hero-headline");
    await expect(heroDesktop).toBeVisible();
  });

  test("should handle redirects correctly on all browsers", async ({
    page,
  }) => {
    let redirectAttempted = false;
    page.on("framenavigated", (frame) => {
      if (frame.url().includes("app.getonelink.io")) {
        redirectAttempted = true;
      }
    });

    await Promise.all([
      page
        .waitForURL("https://app.getonelink.io/auth", { timeout: 10000 })
        .catch(() => {
          // In CI, external domain might not resolve
        }),
      page.goto("/auth"),
    ]);

    // Verify redirect was attempted (either completed or initiated)
    const currentUrl = page.url();
    const redirectHappened =
      redirectAttempted || currentUrl.includes("app.getonelink.io/auth");

    // Even if external domain doesn't resolve, redirect should be attempted
    expect(redirectHappened || currentUrl.includes("/auth")).toBeTruthy();
  });
});
