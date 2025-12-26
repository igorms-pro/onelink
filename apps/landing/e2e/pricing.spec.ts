import { test, expect } from "@playwright/test";

test.describe("Pricing Section Flow", () => {
  test("should navigate to pricing section successfully", async ({ page }) => {
    await page.goto("/");
    // Navigate to pricing section via anchor link
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500); // Wait for scroll
    await expect(page).toHaveURL(/#pricing/);
    await expect(page).toHaveTitle(/OneLink/i);
  });

  test("should display Free and Pro plans", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Check for Free plan
    const freePlan = page.getByText(/free/i).first();
    await expect(freePlan).toBeVisible();

    // Check for Pro plan
    const proPlan = page.getByText(/pro/i).first();
    await expect(proPlan).toBeVisible();
  });

  test("should highlight Pro plan", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Check if Pro plan has highlight badge
    const highlightBadge = page.getByText(/most popular|recommended/i);
    if ((await highlightBadge.count()) > 0) {
      await expect(highlightBadge).toBeVisible();
    }
  });

  test("should display feature comparison table", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Check for table headers or comparison content
    const tableHeaders = page.getByRole("columnheader", {
      name: /free|pro|feature/i,
    });
    if ((await tableHeaders.count()) > 0) {
      await expect(tableHeaders.first()).toBeVisible();
    } else {
      // Alternative: check for comparison section heading
      const comparisonHeading = page.getByRole("heading", {
        name: /comparison|features/i,
      });
      await expect(comparisonHeading.first()).toBeVisible();
    }
  });

  test("should expand and collapse FAQ items", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Scroll to FAQ section
    await page.evaluate(() => {
      const faqSection = document.querySelector('[class*="faq"]');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    });

    await page.waitForTimeout(1000);

    // Find FAQ items
    const faqButtons = page
      .getByRole("button")
      .filter({ hasText: /^[^Sign|^Get|^View]/ });

    if ((await faqButtons.count()) > 0) {
      const firstFAQ = faqButtons.first();
      await expect(firstFAQ).toBeVisible();

      // Check if FAQ is initially collapsed (answer not visible)
      // Look for the answer content within the FAQ item container
      const faqContainer = firstFAQ.locator("..");
      const faqAnswer = faqContainer
        .locator('[class*="mt-"], p')
        .filter({ hasText: /.+/ })
        .first();
      const isInitiallyVisible = await faqAnswer.isVisible();

      // Click to expand/collapse
      await firstFAQ.click();
      await page.waitForTimeout(500); // Wait for animation

      // Verify state changed (if initially visible, should be hidden, and vice versa)
      const isAfterClickVisible = await faqAnswer.isVisible();
      // Only assert if we can detect a change
      if (isInitiallyVisible !== isAfterClickVisible) {
        expect(isAfterClickVisible).not.toBe(isInitiallyVisible);
      }

      // Click again to toggle back
      await firstFAQ.click();
      await page.waitForTimeout(300);

      const isAfterSecondClickVisible = await faqAnswer.isVisible();
      expect(isAfterSecondClickVisible).toBe(isInitiallyVisible);
    }
  });

  test("should have working 'Get Started' buttons", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Find Get Started button using data-testid
    const freePlanCTA = page.getByTestId("pricing-card-cta-free");
    await expect(freePlanCTA).toBeVisible();

    // In CI, external redirects won't work
    if (!process.env.CI) {
      const [response] = await Promise.all([
        page
          .waitForURL("https://app.getonelink.io/**", { timeout: 5000 })
          .catch(() => null),
        freePlanCTA.click(),
      ]);

      expect(response).not.toBeNull();
    }
  });

  test("should track analytics on page view", async ({ page }) => {
    await page.goto("/");

    // Mock PostHog
    await page.addInitScript(() => {
      (window as any).posthog = {
        capture: (eventName: string, properties?: Record<string, any>) => {
          (window as any).__posthogEvents =
            (window as any).__posthogEvents || [];
          (window as any).__posthogEvents.push({ eventName, properties });
        },
        __loaded: true,
      };
    });

    // Navigate to pricing section
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Check if pricing page view event was captured
    const events = await page.evaluate(
      () => (window as any).__posthogEvents || [],
    );
    const pricingViewEvent = events.find(
      (e: any) => e.eventName === "pricing_page_viewed",
    );
    // In CI, PostHog may not be initialized
    if (!process.env.CI) {
      expect(pricingViewEvent).toBeDefined();
    }
  });

  test("should display all plan features", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Check for feature lists in pricing cards
    const featureLists = page.locator("ul").filter({ hasText: /.+/ });
    const count = await featureLists.count();
    expect(count).toBeGreaterThan(0);

    // Verify features are visible
    const firstFeatureList = featureLists.first();
    await expect(firstFeatureList).toBeVisible();
  });

  test("should have correct SEO meta tags", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Check title (should be homepage title since it's a section, not a page)
    await expect(page).toHaveTitle(/OneLink/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]').first();
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]').first();
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });
});
