import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { HeroImage } from "../HeroImage";

describe("HeroImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders all hero images in carousel with duplicates for infinite loop", () => {
    render(<HeroImage />);

    // Should have 8 images total (6 real + 2 duplicates for infinite loop)
    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    expect(images.length).toBe(8);

    // First image should be duplicate of last (for infinite loop)
    expect(images[0]).toHaveAttribute("src", "/images/hero/elias_hero_3.png");
    // Then the 6 real images
    expect(images[1]).toHaveAttribute("src", "/images/hero/nora_hero_1.png");
    expect(images[2]).toHaveAttribute("src", "/images/hero/elias_hero_1.png");
    expect(images[3]).toHaveAttribute("src", "/images/hero/nora_hero_2.png");
    expect(images[4]).toHaveAttribute("src", "/images/hero/elias_hero_2.png");
    expect(images[5]).toHaveAttribute("src", "/images/hero/nora_hero_3.png");
    expect(images[6]).toHaveAttribute("src", "/images/hero/elias_hero_3.png");
    // Last image should be duplicate of first (for infinite loop)
    expect(images[7]).toHaveAttribute("src", "/images/hero/nora_hero_1.png");
  });

  it("has correct structure and classes", () => {
    const { container } = render(<HeroImage />);

    const wrapper = container.querySelector(".relative.rounded-2xl");
    expect(wrapper).toBeInTheDocument();

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    );
    expect(slidingContainer).toBeInTheDocument();
  });

  it("starts with first image visible (transform at index 1 for infinite loop)", () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;
    expect(slidingContainer).toBeInTheDocument();
    // Starts at index 1 (first real image, after duplicate last)
    // 1 out of 8 images = 12.5%
    expect(slidingContainer.style.transform).toBe("translateX(-12.5%)");
  });

  it("auto-rotates to next image after 4 seconds", async () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Initially at index 1 (12.5% for 1/8 of container)
    expect(slidingContainer.style.transform).toBe("translateX(-12.5%)");

    // Fast-forward 4 seconds with act
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    // Should move to next image (index 2 = 25% for 2/8 of container)
    expect(slidingContainer.style.transform).toBe("translateX(-25%)");
  });

  it("does not show navigation buttons", () => {
    render(<HeroImage />);

    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  it("does not show dots indicator", () => {
    render(<HeroImage />);

    expect(screen.queryByLabelText(/Go to image \d+/)).not.toBeInTheDocument();
  });

  it("cycles through all images and loops back seamlessly", async () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Start at index 1 (12.5%)
    expect(slidingContainer.style.transform).toBe("translateX(-12.5%)");

    // Advance through all 6 real images (indices 1-6)
    for (let i = 2; i <= 6; i++) {
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      const expectedTransform = `translateX(-${(i * 100) / 8}%)`;
      expect(slidingContainer.style.transform).toBe(expectedTransform);
    }

    // After reaching duplicate first at end (index 7), should jump back to index 1
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    // Wait for jump to complete
    await act(async () => {
      vi.advanceTimersByTime(750);
    });
    expect(slidingContainer.style.transform).toBe("translateX(-12.5%)");
  });

  it("has correct image alt text", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    // First image is duplicate of last (index 5 = image 6)
    expect(images[0]).toHaveAttribute("alt", "OneLink hero image 6");
    // Then the 6 real images
    expect(images[1]).toHaveAttribute("alt", "OneLink hero image 1");
    expect(images[2]).toHaveAttribute("alt", "OneLink hero image 2");
    expect(images[3]).toHaveAttribute("alt", "OneLink hero image 3");
  });

  it("handles image loading errors gracefully", () => {
    render(<HeroImage />);
    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);

    // Simulate image load error
    const firstImage = images[0] as HTMLImageElement;
    const errorEvent = new Event("error");
    firstImage.dispatchEvent(errorEvent);

    // Image should be hidden on error
    expect(firstImage.style.display).toBe("none");
  });

  it("maintains correct transform during multiple rotations", async () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Start at index 1
    expect(slidingContainer.style.transform).toBe("translateX(-12.5%)");

    // Rotate through first few images
    for (let i = 2; i <= 4; i++) {
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      const expectedTransform = `translateX(-${(i * 100) / 8}%)`;
      expect(slidingContainer.style.transform).toBe(expectedTransform);
    }
  });

  it("cleans up interval on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(<HeroImage />);

    unmount();

    // Should have called clearInterval (for the auto-rotate interval)
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("applies correct transition duration", () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Check that transition classes are applied
    expect(slidingContainer.className).toContain("transition-transform");
    expect(slidingContainer.className).toContain("duration-700");
    expect(slidingContainer.className).toContain("ease-in-out");
  });

  it("renders all images with correct order including duplicates", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);

    // Verify all 8 images are present (6 real + 2 duplicates)
    expect(images.length).toBe(8);

    // Verify order: [last, ...real images, first]
    expect(images[0]).toHaveAttribute("src", "/images/hero/elias_hero_3.png"); // Duplicate last
    expect(images[1]).toHaveAttribute("src", "/images/hero/nora_hero_1.png");
    expect(images[2]).toHaveAttribute("src", "/images/hero/elias_hero_1.png");
    expect(images[3]).toHaveAttribute("src", "/images/hero/nora_hero_2.png");
    expect(images[4]).toHaveAttribute("src", "/images/hero/elias_hero_2.png");
    expect(images[5]).toHaveAttribute("src", "/images/hero/nora_hero_3.png");
    expect(images[6]).toHaveAttribute("src", "/images/hero/elias_hero_3.png");
    expect(images[7]).toHaveAttribute("src", "/images/hero/nora_hero_1.png"); // Duplicate first
  });

  it("has correct container width for all images including duplicates", () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Container should be 800% wide (8 images * 100%: 6 real + 2 duplicates)
    expect(slidingContainer.style.width).toBe("800%");
  });

  it("each image container has correct width", () => {
    const { container } = render(<HeroImage />);

    const imageContainers = container.querySelectorAll(
      ".flex.h-full.transition-transform > div",
    );

    // Each container should be 12.5% of the parent (100% / 8 images)
    imageContainers.forEach((container) => {
      const htmlContainer = container as HTMLElement;
      expect(htmlContainer.style.width).toBe("12.5%");
    });
  });
});
