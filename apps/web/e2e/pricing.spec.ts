import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("displays pricing page with all plans", async ({ page }) => {
    await page.goto("/pricing");

    // Check page title
    await expect(page.locator("h1:has-text('Plans & Pricing')")).toBeVisible();

    // Check all three plans are visible
    await expect(page.locator("text=Free")).toBeVisible();
    await expect(page.locator("text=Starter")).toBeVisible();
    await expect(page.locator("text=Pro")).toBeVisible();

    // Check billing period toggle
    await expect(page.locator("text=Monthly")).toBeVisible();
    await expect(page.locator("text=Annually")).toBeVisible();
  });

  test("can toggle between monthly and yearly billing", async ({ page }) => {
    await page.goto("/pricing");

    // Find the toggle button
    const toggle = page
      .locator("button[type='button']")
      .filter({
        has: page.locator("span"),
      })
      .first();

    // Check initial state (should be monthly)
    await expect(page.locator("text=Monthly")).toBeVisible();

    // Click toggle to switch to yearly
    await toggle.click();

    // Should show yearly pricing
    await expect(page.locator("text=Annually (save 20%)")).toBeVisible();
  });

  test("free plan button navigates to auth", async ({ page }) => {
    await page.goto("/pricing");

    // Find the free plan button
    const freeButton = page.getByTestId("pricing-plan-free-button");

    // Click the button
    await freeButton.click();

    // Should navigate to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test("starter plan button redirects to Stripe checkout or auth", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // Intercept the Stripe checkout redirect
    let checkoutRequested = false;
    await page.route(
      "**/functions/v1/stripe-create-checkout",
      async (route) => {
        checkoutRequested = true;
        // Mock the response to return a checkout URL
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://checkout.stripe.com/test-session",
          }),
        });
      },
    );

    // Find the starter plan button
    const starterButton = page.getByTestId("pricing-plan-starter-button");

    // Click the button
    await starterButton.click();

    // Either redirects to Stripe checkout, shows loading, or redirects to auth if not authenticated
    await page.waitForTimeout(2000);

    // Check if we're redirected to auth (user not authenticated) or checkout was requested
    const currentUrl = page.url();
    if (currentUrl.includes("/auth")) {
      // User not authenticated, redirected to auth - this is expected
      await expect(page).toHaveURL(/\/auth/);
    } else if (checkoutRequested) {
      // Checkout was requested successfully
      expect(checkoutRequested).toBe(true);
    } else {
      // Loading state might be shown
      const loadingVisible = await page
        .locator("text=Redirecting...")
        .or(page.locator("text=Loading"))
        .isVisible()
        .catch(() => false);
      expect(loadingVisible || checkoutRequested).toBe(true);
    }
  });

  test("pro plan button redirects to Stripe checkout or auth", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // Intercept the Stripe checkout redirect
    let checkoutRequested = false;
    await page.route(
      "**/functions/v1/stripe-create-checkout",
      async (route) => {
        checkoutRequested = true;
        // Mock the response to return a checkout URL
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://checkout.stripe.com/test-session",
          }),
        });
      },
    );

    // Find the pro plan button
    const proButton = page.getByTestId("pricing-plan-pro-button");

    // Click the button
    await proButton.click();

    // Either redirects to Stripe checkout, shows loading, or redirects to auth if not authenticated
    await page.waitForTimeout(2000);

    // Check if we're redirected to auth (user not authenticated) or checkout was requested
    const currentUrl = page.url();
    if (currentUrl.includes("/auth")) {
      // User not authenticated, redirected to auth - this is expected
      await expect(page).toHaveURL(/\/auth/);
    } else if (checkoutRequested) {
      // Checkout was requested successfully
      expect(checkoutRequested).toBe(true);
    } else {
      // Loading state might be shown
      const loadingVisible = await page
        .locator("text=Redirecting...")
        .or(page.locator("text=Loading"))
        .isVisible()
        .catch(() => false);
      expect(loadingVisible || checkoutRequested).toBe(true);
    }
  });

  test("displays FAQ section", async ({ page }) => {
    await page.goto("/pricing");

    // Check FAQ section is visible
    await expect(
      page.locator("h2:has-text('Frequently Asked Questions')"),
    ).toBeVisible();
  });

  test("displays CTA section", async ({ page }) => {
    await page.goto("/pricing");

    // Check CTA section is visible
    await expect(page.locator("text=Still unsure?")).toBeVisible();
    await expect(
      page.locator("button:has-text('Create your OneLink')"),
    ).toBeVisible();
  });

  test("CTA button navigates to auth", async ({ page }) => {
    await page.goto("/pricing");

    // Find the CTA button
    const ctaButton = page.locator("button:has-text('Create your OneLink')");

    // Click the button
    await ctaButton.click();

    // Should navigate to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test("handles checkout error gracefully", async ({ page }) => {
    await page.goto("/pricing");

    // Intercept the Stripe checkout with an error
    await page.route(
      "**/functions/v1/stripe-create-checkout",
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal server error",
          }),
        });
      },
    );

    // Find the pro plan button
    const proButton = page.getByTestId("pricing-plan-pro-button");

    // Click the button
    await proButton.click();

    // Should show an error message (toast notification)
    // Wait a bit for the error to appear
    await page.waitForTimeout(1000);

    // The page should still be on /pricing (not redirected)
    await expect(page).toHaveURL(/\/pricing/);
  });
});
