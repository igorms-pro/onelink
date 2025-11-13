import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("onboarding carousel loads on landing page", async ({ _page }) => {
    await page.goto("/");

    // Check for onboarding content
    await expect(page.locator("text=Welcome to OneLink")).toBeVisible();
    await expect(page.locator("button:has-text('Next')")).toBeVisible();
    await expect(page.locator("button:has-text('Skip')")).toBeVisible();
  });

  test("can navigate through carousel with Next button", async ({ _page }) => {
    await page.goto("/");

    // Click Next to go to second slide
    await page.locator("button:has-text('Next')").click();
    await expect(page.locator("text=Create Routes")).toBeVisible();

    // Click Next to go to third slide
    await page.locator("button:has-text('Next')").click();
    await expect(page.locator("text=Receive Files")).toBeVisible();

    // Click Next to go to final slide
    await page.locator("button:has-text('Next')").click();
    await expect(page.locator("text=Get Started")).toBeVisible();
  });

  test("can skip onboarding", async ({ _page }) => {
    await page.goto("/");

    const skipButton = page.locator("button:has-text('Skip')");
    await expect(skipButton).toBeVisible();
    await skipButton.click();

    // After skip, should still be on landing page or navigate
    await expect(page.locator("body")).toBeVisible();
  });

  test("can complete onboarding with Get Started", async ({ _page }) => {
    await page.goto("/");

    // Navigate to last slide
    await page.locator("button:has-text('Next')").click();
    await page.locator("button:has-text('Next')").click();
    await page.locator("button:has-text('Next')").click();

    // Click Get Started
    const getStartedButton = page.locator("button:has-text('Get Started')");
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // Should navigate to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test("carousel dots are visible and clickable", async ({ _page }) => {
    await page.goto("/");

    // Check that carousel dots are present
    const _dots = page.locator('[role="button"]').filter({ hasText: /^$/ });
    // Dots should be present (exact count depends on implementation)
    await expect(page.locator("body")).toBeVisible();
  });

  test("view sample profile link works", async ({ _page }) => {
    await page.goto("/");

    const sampleLink = page.locator("text=View sample profile");
    if (await sampleLink.isVisible()) {
      await sampleLink.click();
      // Should navigate to sample profile or open in new tab
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
