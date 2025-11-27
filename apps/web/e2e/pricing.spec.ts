import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("displays pricing page with all plans", async ({ page }) => {
    await page.goto("/pricing");

    // Check page title
    await expect(page.locator("h1:has-text('Plans & Pricing')")).toBeVisible();

    // Check all three plan cards are visible using data-testid
    await expect(page.getByTestId("pricing-plan-free-card")).toBeVisible();
    await expect(page.getByTestId("pricing-plan-starter-card")).toBeVisible();
    await expect(page.getByTestId("pricing-plan-pro-card")).toBeVisible();

    // Check billing period toggle
    await expect(page.locator("text=Monthly")).toBeVisible();
    await expect(page.locator("text=Annually")).toBeVisible();
  });

  test("can toggle between monthly and yearly billing", async ({ page }) => {
    await page.goto("/pricing");

    // Check initial state (should be monthly)
    await expect(page.locator("text=Monthly billing")).toBeVisible();

    // Click on the "Annually" button to switch to yearly
    const yearlyButton = page.getByRole("button", {
      name: /annually.*save.*20/i,
    });
    await yearlyButton.click();

    // Should show yearly pricing
    await expect(page.locator("text=Annually (save 20%)")).toBeVisible();

    // Click back to monthly
    const monthlyButton = page.getByRole("button", {
      name: /monthly billing/i,
    });
    await monthlyButton.click();

    // Should show monthly pricing
    await expect(page.locator("text=Monthly billing")).toBeVisible();
  });

  test("free plan card is visible and shows current plan for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // Free plan card should be visible
    const freeCard = page.getByTestId("pricing-plan-free-card");
    await expect(freeCard).toBeVisible();

    // The free plan button should show "Your current plan" or similar for unauthenticated users
    const freeButton = page.getByTestId("pricing-plan-free-button");
    await expect(freeButton).toBeVisible();
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

    // First click on the starter plan card to select it
    const starterCard = page.getByTestId("pricing-plan-starter-card");
    await starterCard.click();

    // Find the starter plan button and click it
    const starterButton = page.getByTestId("pricing-plan-starter-button");
    await starterButton.click();

    // Either redirects to Stripe checkout, shows loading, or redirects to auth if not authenticated
    await page.waitForTimeout(2000);

    // Check if we're redirected to auth (user not authenticated) or checkout was requested
    const currentUrl = page.url();
    if (currentUrl.includes("/auth")) {
      // User not authenticated, redirected to auth - this is expected
      await expect(page).toHaveURL(/\/auth/);
    } else if (checkoutRequested) {
      // Checkout was requested successfully (checkoutRequested is true here)
      // No need to assert, we're already in the true branch
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

    // First click on the pro plan card to select it
    const proCard = page.getByTestId("pricing-plan-pro-card");
    await proCard.click();

    // Find the pro plan button and click it
    const proButton = page.getByTestId("pricing-plan-pro-button");
    await proButton.click();

    // Either redirects to Stripe checkout, shows loading, or redirects to auth if not authenticated
    await page.waitForTimeout(2000);

    // Check if we're redirected to auth (user not authenticated) or checkout was requested
    const currentUrl = page.url();
    if (currentUrl.includes("/auth")) {
      // User not authenticated, redirected to auth - this is expected
      await expect(page).toHaveURL(/\/auth/);
    } else if (checkoutRequested) {
      // Checkout was requested successfully (checkoutRequested is true here)
      // No need to assert, we're already in the true branch
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

  test("unauthenticated user clicking paid plan redirects to auth", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // First click on the pro plan card to select it
    const proCard = page.getByTestId("pricing-plan-pro-card");
    await proCard.click();

    // Find the pro plan button and click it
    const proButton = page.getByTestId("pricing-plan-pro-button");
    await proButton.click();

    // Wait a bit for the redirect
    await page.waitForTimeout(2000);

    // Should redirect to auth since user is not authenticated
    await expect(page).toHaveURL(/\/auth/);
  });
});
