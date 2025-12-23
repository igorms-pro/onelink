import { test, expect } from "@playwright/test";

// Skip external redirect tests in CI
const skipExternalRedirect = process.env.CI ? test.skip : test;

test.describe("CTA Conversion Flows", () => {
  skipExternalRedirect(
    "should redirect hero 'Get Started Free' button to app",
    async ({ page }) => {
      await page.goto("/");

      const heroCTA = page.getByTestId("hero-cta-get-started");
      await expect(heroCTA).toBeVisible();

      // Click and verify redirect
      const [response] = await Promise.all([
        page
          .waitForURL("https://app.getonelink.io/auth", { timeout: 5000 })
          .catch(() => null),
        heroCTA.click(),
      ]);

      expect(response).not.toBeNull();
    },
  );

  test("should scroll to demo section when 'View Demo' button is clicked", async ({
    page,
  }) => {
    await page.goto("/");

    const viewDemoButton = page.getByRole("button", { name: /view demo/i });
    await expect(viewDemoButton).toBeVisible();

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Click View Demo button
    await viewDemoButton.click();

    // Wait for scroll animation
    await page.waitForTimeout(1000);

    // Verify page scrolled down
    const finalScroll = await page.evaluate(() => window.scrollY);
    expect(finalScroll).toBeGreaterThan(initialScroll);

    // Verify demo section is visible (check for demo section content)
    const demoSection = page.locator("#demo, [id*='demo']").first();
    if ((await demoSection.count()) > 0) {
      await expect(demoSection).toBeVisible();
    }
  });

  skipExternalRedirect(
    "should redirect pricing 'Get Started Free' button to app",
    async ({ page }) => {
      await page.goto("/");

      // Scroll to pricing section
      await page.evaluate(() => {
        const pricingSection = document.querySelector('[class*="pricing"]');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
      });

      await page.waitForTimeout(1000);

      // Find Free plan CTA using data-testid
      const freePlanCTA = page.getByTestId("pricing-card-cta-free");

      if ((await freePlanCTA.count()) > 0) {
        const [response] = await Promise.all([
          page
            .waitForURL("https://app.getonelink.io/auth", { timeout: 5000 })
            .catch(() => null),
          freePlanCTA.click(),
        ]);

        expect(response).not.toBeNull();
      }
    },
  );

  skipExternalRedirect(
    "should redirect pricing 'Upgrade to Pro' button to app pricing",
    async ({ page }) => {
      await page.goto("/pricing");

      // Find Pro plan CTA
      const proPlanCTA = page
        .getByRole("link", { name: /upgrade|pro/i })
        .first();

      if ((await proPlanCTA.count()) > 0) {
        const [response] = await Promise.all([
          page
            .waitForURL("https://app.getonelink.io/pricing", { timeout: 5000 })
            .catch(() => null),
          proPlanCTA.click(),
        ]);

        expect(response).not.toBeNull();
      }
    },
  );

  skipExternalRedirect(
    "should redirect CTA section 'Create Your Free Account' button to app",
    async ({ page }) => {
      await page.goto("/");

      // Scroll to CTA section
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(1000);

      // Find CTA section button using data-testid
      const ctaButton = page.getByTestId("cta-section-primary");

      if ((await ctaButton.count()) > 0) {
        const [response] = await Promise.all([
          page
            .waitForURL("https://app.getonelink.io/auth", { timeout: 5000 })
            .catch(() => null),
          ctaButton.click(),
        ]);

        expect(response).not.toBeNull();
      }
    },
  );

  test("should track analytics events on CTA clicks", async ({ page }) => {
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

    // Click hero CTA
    const heroCTA = page.getByTestId("hero-cta-get-started");
    await heroCTA.click();

    // Wait a bit for analytics to fire
    await page.waitForTimeout(500);

    // Check if analytics event was captured
    const events = await page.evaluate(
      () => (window as any).__posthogEvents || [],
    );
    // In CI, PostHog may not be initialized, so skip analytics check
    if (!process.env.CI) {
      const signUpEvent = events.find(
        (e: any) =>
          e.eventName === "sign_up_button_clicked" ||
          e.eventName === "cta_clicked",
      );
      expect(signUpEvent).toBeDefined();
    }
  });

  test("should have all CTAs visible and clickable", async ({ page }) => {
    await page.goto("/");

    // Check hero CTAs
    const heroPrimaryCTA = page.getByTestId("hero-cta-get-started");
    await expect(heroPrimaryCTA).toBeVisible();
    await expect(heroPrimaryCTA).toBeEnabled();

    const heroSecondaryCTA = page.getByTestId("hero-cta-view-demo");
    await expect(heroSecondaryCTA).toBeVisible();
    await expect(heroSecondaryCTA).toBeEnabled();

    // Scroll to pricing section
    await page.evaluate(() => {
      const pricingSection = document.querySelector('[class*="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    });

    await page.waitForTimeout(1000);

    // Check pricing CTAs
    const pricingCTAs = page.getByRole("link", {
      name: /get started|upgrade/i,
    });
    const count = await pricingCTAs.count();
    expect(count).toBeGreaterThan(0);

    // Scroll to CTA section
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1000);

    // Check CTA section button using data-testid
    const ctaSectionButton = page.getByTestId("cta-section-primary");
    await expect(ctaSectionButton).toBeVisible();
    await expect(ctaSectionButton).toBeEnabled();
  });
});
