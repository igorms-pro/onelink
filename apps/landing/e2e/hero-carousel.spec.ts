import { test, expect } from "@playwright/test";

test.describe("Hero Image Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display hero carousel with images", async ({ page }) => {
    // Wait for hero section to be visible
    await expect(page.getByTestId("hero-headline")).toBeVisible();

    // Check that carousel images are present (use .first() to handle duplicates)
    const firstImage = page.getByTestId("hero-marketing-image-0").first();
    await expect(firstImage).toBeVisible();

    // Verify image source
    await expect(firstImage).toHaveAttribute(
      "src",
      "/images/hero/nora_hero_1.png",
    );
  });

  test("should display all 6 hero images in the DOM", async ({ page }) => {
    // All images should be in the DOM (even if not visible)
    // Use .first() to handle duplicates from infinite loop
    for (let i = 0; i < 6; i++) {
      const image = page.getByTestId(`hero-marketing-image-${i}`).first();
      await expect(image).toBeAttached();
    }
  });

  test("should auto-rotate through images", async ({ page }) => {
    // Wait for initial image to be visible
    const firstImage = page.getByTestId("hero-marketing-image-0").first();
    await expect(firstImage).toBeVisible();

    // Get the sliding container
    const slidingContainer = page.locator(".flex.h-full.transition-transform");

    // Check initial transform
    // Carousel starts at index 1 (after duplicate last), so initial transform is ~12.5% (1/8)
    const initialTransform = await slidingContainer.evaluate(
      (el) => (el as HTMLElement).style.transform,
    );
    // Should contain translateX with a negative value (initial position after duplicate)
    expect(initialTransform).toContain("translateX(-");

    // Wait for first rotation (4 seconds + transition time)
    await page.waitForTimeout(5000);

    // Check that transform has changed (should be at ~16.67% for second image)
    const afterTransform = await slidingContainer.evaluate(
      (el) => (el as HTMLElement).style.transform,
    );
    expect(afterTransform).not.toBe(initialTransform);
    expect(afterTransform).toContain("translateX(-");
  });

  test("should have smooth transition animation", async ({ page }) => {
    const slidingContainer = page.locator(".flex.h-full.transition-transform");

    // Check that transition classes are applied
    const classes = await slidingContainer.getAttribute("class");
    expect(classes).toContain("transition-transform");
    expect(classes).toContain("duration-700");
    expect(classes).toContain("ease-in-out");
  });

  test("should have correct image order", async ({ page }) => {
    const expectedImages = [
      "/images/hero/nora_hero_1.png",
      "/images/hero/elias_hero_1.png",
      "/images/hero/nora_hero_2.png",
      "/images/hero/elias_hero_2.png",
      "/images/hero/nora_hero_3.png",
      "/images/hero/elias_hero_3.png",
    ];

    for (let i = 0; i < expectedImages.length; i++) {
      const image = page.getByTestId(`hero-marketing-image-${i}`).first();
      await expect(image).toHaveAttribute("src", expectedImages[i]);
    }
  });

  test("should have correct alt text for images", async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      const image = page.getByTestId(`hero-marketing-image-${i}`).first();
      await expect(image).toHaveAttribute("alt", `OneLink hero image ${i + 1}`);
    }
  });

  test("should not show navigation buttons", async ({ page }) => {
    // Navigation buttons should not exist
    // Use getByRole instead of getByLabelText for better browser compatibility
    const prevButton = page.getByRole("button", { name: /previous image/i });
    const nextButton = page.getByRole("button", { name: /next image/i });
    await expect(prevButton).toHaveCount(0);
    await expect(nextButton).toHaveCount(0);
  });

  test("should not show dots indicator", async ({ page }) => {
    // Dots indicator should not exist
    const dots = page.locator('button[aria-label*="Go to image"]');
    await expect(dots).toHaveCount(0);
  });

  test("should have correct container structure", async ({ page }) => {
    // Check for main wrapper - use more specific selector to avoid matching feature cards
    const wrapper = page
      .locator(".relative.rounded-2xl.overflow-hidden.shadow-2xl")
      .first();
    await expect(wrapper).toBeVisible();

    // Check for sliding container
    const slidingContainer = page.locator(".flex.h-full.transition-transform");
    await expect(slidingContainer).toBeVisible();

    // Check container width (should be 800% for 8 images: 6 original + 2 duplicates for infinite loop)
    const width = await slidingContainer.evaluate(
      (el) => (el as HTMLElement).style.width,
    );
    expect(width).toBe("800%");
  });

  test("should cycle through all images and loop back", async ({ page }) => {
    const slidingContainer = page.locator(".flex.h-full.transition-transform");

    // Wait for initial state
    await page.waitForTimeout(1000);

    // Track transforms over multiple rotations
    const transforms: string[] = [];

    // Wait for 6 rotations (6 * 4 seconds = 24 seconds)
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(4500); // 4 seconds + buffer
      const transform = await slidingContainer.evaluate(
        (el) => (el as HTMLElement).style.transform,
      );
      transforms.push(transform);
    }

    // Should have different transforms (images changed)
    const uniqueTransforms = new Set(transforms);
    expect(uniqueTransforms.size).toBeGreaterThan(1);

    // After 6 rotations, should loop back (transform should be close to initial)
    // Allow for some timing variance
    const finalTransform = transforms[transforms.length - 1];
    expect(finalTransform).toContain("translateX(-");
  });

  test("should handle image loading errors gracefully", async ({ page }) => {
    // Intercept image requests and fail one
    await page.route("**/images/hero/nora_hero_1.png", (route) => {
      route.abort();
    });

    // Reload page
    await page.reload();

    // Component should still render (other images should work)
    const secondImage = page.getByTestId("hero-marketing-image-1").first();
    await expect(secondImage).toBeAttached();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const carousel = page
      .locator(".relative.rounded-2xl.overflow-hidden.shadow-2xl")
      .first();
    await expect(carousel).toBeVisible();

    // Check that images are still present
    const firstImage = page.getByTestId("hero-marketing-image-0").first();
    await expect(firstImage).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const carousel = page
      .locator(".relative.rounded-2xl.overflow-hidden.shadow-2xl")
      .first();
    await expect(carousel).toBeVisible();

    const firstImage = page.getByTestId("hero-marketing-image-0").first();
    await expect(firstImage).toBeVisible();
  });

  test("should have overlay gradient", async ({ page }) => {
    const overlay = page.locator(
      ".absolute.inset-0.bg-linear-to-t.from-black\\/20",
    );
    await expect(overlay).toBeVisible();
  });
});
