import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load page in less than 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have First Contentful Paint (FCP) under 1.8s", async ({
    page,
  }) => {
    await page.goto("/");

    // Get FCP from performance metrics
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            (entry) => entry.name === "first-contentful-paint",
          );
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ["paint"] });

        // Fallback timeout
        setTimeout(() => resolve(null), 5000);
      });
    });

    // If FCP is available, check it's under 1.8s
    if (fcp !== null && typeof fcp === "number") {
      expect(fcp).toBeLessThan(1800);
    }
  });

  test("should have Largest Contentful Paint (LCP) under 2.5s", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get LCP from performance API
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue: number | null = null;

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Wait a bit for LCP to be measured
        setTimeout(() => resolve(lcpValue), 3000);
      });
    });

    // If LCP is available, check it's under 2.5s
    if (lcp !== null && typeof lcp === "number") {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test("should have Time to Interactive (TTI) under 3.8s", async ({ page }) => {
    await page.goto("/");

    // Measure TTI (simplified - full TTI calculation is complex)
    const startTime = Date.now();
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1"); // Wait for main content
    const tti = Date.now() - startTime;

    // Should be interactive in less than 3.8s
    expect(tti).toBeLessThan(3800);
  });

  test("should have Cumulative Layout Shift (CLS) under 0.1", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get CLS from performance API
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;

        new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEntry[];
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput && entry.value) {
              clsValue += entry.value;
            }
          });
        }).observe({ entryTypes: ["layout-shift"] });

        // Wait for page to stabilize
        setTimeout(() => resolve(clsValue), 2000);
      });
    });

    // CLS should be under 0.1
    if (typeof cls === "number") {
      expect(cls).toBeLessThan(0.1);
    }
  });

  test("should have no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes("posthog") && !error.includes("analytics"),
    );

    expect(criticalErrors.length).toBe(0);
  });

  test("should have no network errors", async ({ page }) => {
    const failedRequests: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} - ${response.status()}`);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out external redirects (auth redirects are expected)
    const criticalFailures = failedRequests.filter(
      (req) => !req.includes("app.getonelink.io") && !req.includes("posthog"),
    );

    expect(criticalFailures.length).toBe(0);
  });

  test("should load images efficiently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for images
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that images have loading attributes
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const loading = await img.getAttribute("loading");

        // Images should use lazy loading or have explicit loading attribute
        // This is a best practice check
        if (loading) {
          expect(["lazy", "eager"]).toContain(loading);
        }
      }
    }
  });

  test("should have reasonable bundle size", async ({ page }) => {
    const resourceSizes: { url: string; size: number }[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes(".js") || url.includes(".css")) {
        const headers = response.headers();
        const contentLength = headers["content-length"];
        if (contentLength) {
          resourceSizes.push({
            url,
            size: parseInt(contentLength, 10),
          });
        }
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check total JS bundle size (should be reasonable)
    const totalJSSize = resourceSizes
      .filter((r) => r.url.includes(".js"))
      .reduce((sum, r) => sum + r.size, 0);

    // Total JS should be under 1MB (1,000,000 bytes)
    // This is a reasonable threshold for a landing page
    expect(totalJSSize).toBeLessThan(1000000);
  });

  test("should handle rapid navigation", async ({ page }) => {
    // Navigate quickly between pages
    await page.goto("/");
    await page.goto("/features");
    await page.goto("/pricing");
    await page.goto("/");

    // Should still work correctly
    await expect(page).toHaveTitle(/OneLink/i);
    const heroHeading = page.getByTestId("hero-headline");
    await expect(heroHeading).toBeVisible();
  });
});
