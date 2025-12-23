import { test, expect } from "@playwright/test";

test.describe("Pricing Page Flow", () => {
  test("should load pricing page successfully", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing/i);
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("should display Free and Pro plans", async ({ page }) => {
    await page.goto("/pricing");

    // Check for Free plan
    const freePlan = page.getByText(/free/i).first();
    await expect(freePlan).toBeVisible();

    // Check for Pro plan
    const proPlan = page.getByText(/pro/i).first();
    await expect(proPlan).toBeVisible();
  });

  test("should highlight Pro plan", async ({ page }) => {
    await page.goto("/pricing");

    // Check if Pro plan has highlight badge
    const highlightBadge = page.getByText(/most popular|recommended/i);
    if ((await highlightBadge.count()) > 0) {
      await expect(highlightBadge).toBeVisible();
    }
  });

  test("should display feature comparison table", async ({ page }) => {
    await page.goto("/pricing");

    // Scroll to feature comparison section
    await page.evaluate(() => {
      const comparisonSection = document.querySelector(
        '[class*="comparison"], [class*="table"]',
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: "smooth" });
      }
    });

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
    await page.goto("/pricing");

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
      const faqAnswer = firstFAQ
        .locator("..")
        .locator("p, div")
        .filter({ hasText: /.+/ })
        .last();
      const isInitiallyVisible = await faqAnswer.isVisible();

      // Click to expand/collapse
      await firstFAQ.click();
      await page.waitForTimeout(300);

      // Verify state changed
      const isAfterClickVisible = await faqAnswer.isVisible();
      expect(isAfterClickVisible).not.toBe(isInitiallyVisible);

      // Click again to toggle back
      await firstFAQ.click();
      await page.waitForTimeout(300);

      const isAfterSecondClickVisible = await faqAnswer.isVisible();
      expect(isAfterSecondClickVisible).toBe(isInitiallyVisible);
    }
  });

  test("should have working 'Get Started' buttons", async ({ page }) => {
    await page.goto("/pricing");

    // Find Get Started buttons
    const getStartedButtons = page.getByRole("link", { name: /get started/i });
    const count = await getStartedButtons.count();

    expect(count).toBeGreaterThan(0);

    // Click first Get Started button
    const firstButton = getStartedButtons.first();
    await expect(firstButton).toBeVisible();

    const [response] = await Promise.all([
      page
        .waitForURL("https://app.getonelink.io/**", { timeout: 5000 })
        .catch(() => null),
      firstButton.click(),
    ]);

    expect(response).not.toBeNull();
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

    // Navigate to pricing page
    await page.goto("/pricing");
    await page.waitForTimeout(1000);

    // Check if pricing page view event was captured
    const events = await page.evaluate(
      () => (window as any).__posthogEvents || [],
    );
    const pricingViewEvent = events.find(
      (e: any) => e.eventName === "pricing_page_viewed",
    );
    expect(pricingViewEvent).toBeDefined();
  });

  test("should display all plan features", async ({ page }) => {
    await page.goto("/pricing");

    // Check for feature lists in pricing cards
    const featureLists = page.locator("ul").filter({ hasText: /.+/ });
    const count = await featureLists.count();
    expect(count).toBeGreaterThan(0);

    // Verify features are visible
    const firstFeatureList = featureLists.first();
    await expect(firstFeatureList).toBeVisible();
  });

  test("should have correct SEO meta tags", async ({ page }) => {
    await page.goto("/pricing");

    // Check title
    await expect(page).toHaveTitle(/Pricing/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });
});
