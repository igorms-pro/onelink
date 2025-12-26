import { test, expect } from "@playwright/test";

test.describe("SEO Tests", () => {
  test("should have unique title on homepage", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain("OneLink");
  });

  test("should navigate to pricing section", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /pricing/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain("OneLink");
    await expect(page).toHaveURL(/#pricing/);
  });

  test("should navigate to features section", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /features/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain("OneLink");
    await expect(page).toHaveURL(/#features/);
  });

  test("should have meta descriptions on homepage", async ({ page }) => {
    await page.goto("/");

    const metaDescription = page.locator('meta[name="description"]').first();
    const content = await metaDescription.getAttribute("content");

    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(0);
    expect(content?.length).toBeLessThan(160); // Should be under 160 chars
  });

  test("should have Open Graph tags", async ({ page }) => {
    await page.goto("/");

    // Check for OG title
    const ogTitle = page.locator('meta[property="og:title"]').first();
    await expect(ogTitle).toHaveAttribute("content", /.+/);

    // Check for OG description
    const ogDescription = page
      .locator('meta[property="og:description"]')
      .first();
    await expect(ogDescription).toHaveAttribute("content", /.+/);

    // Check for OG type
    const ogType = page.locator('meta[property="og:type"]').first();
    if ((await ogType.count()) > 0) {
      await expect(ogType).toHaveAttribute("content", /.+/);
    }

    // Check for OG URL
    const ogUrl = page.locator('meta[property="og:url"]').first();
    if ((await ogUrl.count()) > 0) {
      await expect(ogUrl).toHaveAttribute("content", /.+/);
    }
  });

  test("should have Twitter Card tags", async ({ page }) => {
    await page.goto("/");

    // Check for Twitter card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    if ((await twitterCard.count()) > 0) {
      await expect(twitterCard).toHaveAttribute("content", /.+/);
    }

    // Check for Twitter title
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    if ((await twitterTitle.count()) > 0) {
      await expect(twitterTitle).toHaveAttribute("content", /.+/);
    }

    // Check for Twitter description
    const twitterDescription = page.locator('meta[name="twitter:description"]');
    if ((await twitterDescription.count()) > 0) {
      await expect(twitterDescription).toHaveAttribute("content", /.+/);
    }
  });

  test("should have canonical URL", async ({ page }) => {
    await page.goto("/");

    const canonical = page.locator('link[rel="canonical"]');
    if ((await canonical.count()) > 0) {
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("/");
    }
  });

  test("should have accessible sitemap.xml", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");

    if (response) {
      expect(response.status()).toBe(200);

      const content = await response.text();
      expect(content).toBeTruthy();
      expect(content).toContain("xml");
    }
  });

  test("should have accessible robots.txt", async ({ page }) => {
    const response = await page.goto("/robots.txt");

    if (response) {
      expect(response.status()).toBe(200);

      const content = await response.text();
      expect(content).toBeTruthy();
    }
  });

  test("should have no broken internal links", async ({ page }) => {
    await page.goto("/");

    // Find all internal links (excluding hash anchors)
    const internalLinks = page
      .locator('a[href^="/"]')
      .filter({ hasNotText: /#/ });
    const linkCount = await internalLinks.count();

    const brokenLinks: string[] = [];

    for (let i = 0; i < linkCount; i++) {
      const link = internalLinks.nth(i);
      const href = await link.getAttribute("href");

      if (href && !href.startsWith("http") && !href.includes("#")) {
        // Try to navigate and check if page loads
        try {
          await page.goto(href);
          await page.waitForLoadState("networkidle", { timeout: 5000 });
        } catch {
          brokenLinks.push(href);
        }

        // Go back to homepage
        await page.goto("/");
      }
    }

    expect(brokenLinks.length).toBe(0);
  });

  test("should use rel='noopener noreferrer' on external links", async ({
    page,
  }) => {
    await page.goto("/");

    // Find external links
    const externalLinks = page.locator('a[href^="http"]');
    const linkCount = await externalLinks.count();

    if (linkCount > 0) {
      for (let i = 0; i < linkCount; i++) {
        const link = externalLinks.nth(i);
        const rel = await link.getAttribute("rel");

        // Should have noopener noreferrer or at least noopener
        if (rel) {
          expect(rel).toMatch(/noopener/);
        }
      }
    }
  });

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Check for h1
    const h1 = page.locator("h1");
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have only one h1

    // Check h1 contains main keyword
    const h1Text = await h1.first().textContent();
    expect(h1Text?.toLowerCase()).toMatch(/onelink|one link/i);
  });

  test("should have semantic HTML structure", async ({ page }) => {
    await page.goto("/");

    // Check for semantic elements
    const semanticElements = await page.evaluate(() => {
      return {
        main: document.querySelector("main") !== null,
        header: document.querySelector("header") !== null,
        footer: document.querySelector("footer") !== null,
        nav: document.querySelector("nav") !== null,
        article: document.querySelector("article") !== null,
        section: document.querySelectorAll("section").length > 0,
      };
    });

    expect(semanticElements.main).toBe(true);
    expect(semanticElements.header).toBe(true);
    expect(semanticElements.footer).toBe(true);
    expect(semanticElements.nav).toBe(true);
  });

  test("should have alt text for important images", async ({ page }) => {
    await page.goto("/");

    // Find images (excluding decorative ones)
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        const role = await img.getAttribute("role");

        // Images should have alt text (can be empty for decorative, but should exist)
        // Or have role="presentation" if decorative
        expect(alt !== null || role === "presentation").toBe(true);
      }
    }
  });
});
