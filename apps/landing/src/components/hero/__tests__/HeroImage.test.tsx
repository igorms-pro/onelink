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

  it("renders all hero images in carousel", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    expect(images.length).toBe(6);
    expect(images[0]).toHaveAttribute("src", "/images/hero/nora_hero_1.png");
    expect(images[1]).toHaveAttribute("src", "/images/hero/elias_hero_1.png");
    expect(images[2]).toHaveAttribute("src", "/images/hero/nora_hero_2.png");
    expect(images[3]).toHaveAttribute("src", "/images/hero/elias_hero_2.png");
    expect(images[4]).toHaveAttribute("src", "/images/hero/nora_hero_3.png");
    expect(images[5]).toHaveAttribute("src", "/images/hero/elias_hero_3.png");
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

  it("starts with first image visible (transform at 0%)", () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;
    expect(slidingContainer).toBeInTheDocument();
    expect(slidingContainer.style.transform).toBe("translateX(-0%)");
  });

  it("auto-rotates to next image after 4 seconds", async () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Initially at 0%
    expect(slidingContainer.style.transform).toBe("translateX(-0%)");

    // Fast-forward 4 seconds with act
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    // Should move to next image (16.67% for 1/6 of container)
    expect(slidingContainer.style.transform).toBe(
      "translateX(-16.666666666666668%)",
    );
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

  it("cycles through all images and loops back", async () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Start at 0%
    expect(slidingContainer.style.transform).toBe("translateX(-0%)");

    // Advance through first 5 images
    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      const expectedTransform = `translateX(-${(i * 100) / 6}%)`;
      expect(slidingContainer.style.transform).toBe(expectedTransform);
    }

    // After 6th advance, should loop back to first (index 0 = 0%)
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(slidingContainer.style.transform).toBe("translateX(-0%)");
  });

  it("has correct image alt text", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    expect(images[0]).toHaveAttribute("alt", "OneLink hero image 1");
    expect(images[1]).toHaveAttribute("alt", "OneLink hero image 2");
    expect(images[2]).toHaveAttribute("alt", "OneLink hero image 3");
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

    // Rotate through all images twice (12 advances)
    for (let i = 0; i < 12; i++) {
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      const expectedIndex = (i + 1) % 6;
      const expectedTransform = `translateX(-${(expectedIndex * 100) / 6}%)`;
      expect(slidingContainer.style.transform).toBe(expectedTransform);
    }
  });

  it("cleans up interval on unmount", async () => {
    const { unmount } = render(<HeroImage />);
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

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

  it("renders all images with correct order", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);

    // Verify all 6 images are present
    expect(images.length).toBe(6);

    // Verify order matches HERO_IMAGES array
    expect(images[0]).toHaveAttribute("src", "/images/hero/nora_hero_1.png");
    expect(images[1]).toHaveAttribute("src", "/images/hero/elias_hero_1.png");
    expect(images[2]).toHaveAttribute("src", "/images/hero/nora_hero_2.png");
    expect(images[3]).toHaveAttribute("src", "/images/hero/elias_hero_2.png");
    expect(images[4]).toHaveAttribute("src", "/images/hero/nora_hero_3.png");
    expect(images[5]).toHaveAttribute("src", "/images/hero/elias_hero_3.png");
  });

  it("has correct container width for all images", () => {
    const { container } = render(<HeroImage />);

    const slidingContainer = container.querySelector(
      ".flex.h-full.transition-transform",
    ) as HTMLElement;

    // Container should be 600% wide (6 images * 100%)
    expect(slidingContainer.style.width).toBe("600%");
  });

  it("each image container has correct width", () => {
    const { container } = render(<HeroImage />);

    const imageContainers = container.querySelectorAll(
      ".flex.h-full.transition-transform > div",
    );

    // Each container should be 16.67% of the parent (100% / 6)
    imageContainers.forEach((container) => {
      const htmlContainer = container as HTMLElement;
      expect(htmlContainer.style.width).toBe("16.666666666666668%");
    });
  });
});
