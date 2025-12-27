import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

    // Fast-forward 4 seconds
    vi.advanceTimersByTime(4000);

    await waitFor(() => {
      // Should move to next image (16.67% for 1/6 of container)
      expect(slidingContainer.style.transform).toBe(
        "translateX(-16.666666666666668%)",
      );
    });
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

    // Advance through all 6 images (4 seconds each = 24 seconds total)
    for (let i = 1; i <= 6; i++) {
      vi.advanceTimersByTime(4000);
      await waitFor(() => {
        const expectedTransform = `translateX(-${(i * 100) / 6}%)`;
        expect(slidingContainer.style.transform).toBe(expectedTransform);
      });
    }

    // After 6 images, should loop back to first (index 0 = 0%)
    vi.advanceTimersByTime(4000);
    await waitFor(() => {
      expect(slidingContainer.style.transform).toBe("translateX(-0%)");
    });
  });

  it("has correct image alt text", () => {
    render(<HeroImage />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    expect(images[0]).toHaveAttribute("alt", "OneLink hero image 1");
    expect(images[1]).toHaveAttribute("alt", "OneLink hero image 2");
    expect(images[2]).toHaveAttribute("alt", "OneLink hero image 3");
  });
});
