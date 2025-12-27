import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroImage } from "../HeroImage";

describe("HeroImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    delete import.meta.env.VITE_HERO_IMAGE_URL;
    delete import.meta.env.VITE_HERO_IMAGES;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete import.meta.env.VITE_HERO_IMAGE_URL;
    delete import.meta.env.VITE_HERO_IMAGES;
  });

  it("renders placeholder when no images are configured", () => {
    delete import.meta.env.VITE_HERO_IMAGE_URL;
    delete import.meta.env.VITE_HERO_IMAGES;

    render(<HeroImage />);

    expect(screen.getByText(/Marketing Images Carousel/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Add your marketing\/lifestyle images/i),
    ).toBeInTheDocument();
  });

  it("renders placeholder correctly", () => {
    render(<HeroImage />);

    expect(screen.getByText(/Marketing Images Carousel/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Add your marketing\/lifestyle images/i),
    ).toBeInTheDocument();
  });

  it("has correct structure and classes", () => {
    const { container } = render(<HeroImage />);

    const wrapper = container.querySelector(".relative.rounded-2xl");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders image ideas in placeholder", () => {
    render(<HeroImage />);

    expect(screen.getByText(/Creator using OneLink/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Freelancer portfolio showcase/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Business professional sharing/i),
    ).toBeInTheDocument();
  });

  it("renders single image when VITE_HERO_IMAGE_URL is set", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGE_URL;
    import.meta.env.VITE_HERO_IMAGE_URL = "/test-image.jpg";

    render(<HeroImage />);

    const image = screen.getByTestId("hero-marketing-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
    expect(image).toHaveAttribute(
      "alt",
      "OneLink - Share everything with one link",
    );

    // Restore
    import.meta.env.VITE_HERO_IMAGE_URL = originalEnv;
  });

  it("renders carousel when VITE_HERO_IMAGES is set", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
      "/image3.jpg",
    ]);

    render(<HeroImage />);

    const images = screen.getAllByTestId("hero-marketing-image");
    expect(images.length).toBe(3);
    expect(images[0]).toHaveAttribute("src", "/image1.jpg");

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });

  it("shows navigation arrows when multiple images", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
    ]);

    render(<HeroImage />);

    const prevButton = screen.getByLabelText("Previous image");
    const nextButton = screen.getByLabelText("Next image");
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });

  it("shows dots indicator when multiple images", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
      "/image3.jpg",
    ]);

    render(<HeroImage />);

    const dot1 = screen.getByLabelText("Go to image 1");
    const dot2 = screen.getByLabelText("Go to image 2");
    const dot3 = screen.getByLabelText("Go to image 3");
    expect(dot1).toBeInTheDocument();
    expect(dot2).toBeInTheDocument();
    expect(dot3).toBeInTheDocument();

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });

  it("does not show navigation when single image", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGE_URL;
    import.meta.env.VITE_HERO_IMAGE_URL = "/test-image.jpg";

    render(<HeroImage />);

    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();

    // Restore
    import.meta.env.VITE_HERO_IMAGE_URL = originalEnv;
  });

  it("navigates to next image when next button is clicked", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
    ]);

    render(<HeroImage />);

    const images = screen.getAllByTestId("hero-marketing-image");
    // First image container should be visible initially
    const firstContainer = images[0].closest("div");
    const secondContainer = images[1].closest("div");
    expect(firstContainer).toHaveClass("opacity-100");
    expect(secondContainer).toHaveClass("opacity-0");

    const nextButton = screen.getByLabelText("Next image");
    fireEvent.click(nextButton);

    // After clicking next, second image container should be visible
    expect(firstContainer).toHaveClass("opacity-0");
    expect(secondContainer).toHaveClass("opacity-100");

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });

  it("navigates to previous image when previous button is clicked", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
    ]);

    render(<HeroImage />);

    const images = screen.getAllByTestId("hero-marketing-image");
    const firstContainer = images[0].closest("div");
    const secondContainer = images[1].closest("div");
    const nextButton = screen.getByLabelText("Next image");
    const prevButton = screen.getByLabelText("Previous image");

    // Go to second image first
    fireEvent.click(nextButton);
    expect(secondContainer).toHaveClass("opacity-100");

    // Then go back to first image
    fireEvent.click(prevButton);
    expect(firstContainer).toHaveClass("opacity-100");
    expect(secondContainer).toHaveClass("opacity-0");

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });

  it("navigates to specific image when dot is clicked", () => {
    const originalEnv = import.meta.env.VITE_HERO_IMAGES;
    import.meta.env.VITE_HERO_IMAGES = JSON.stringify([
      "/image1.jpg",
      "/image2.jpg",
      "/image3.jpg",
    ]);

    render(<HeroImage />);

    const images = screen.getAllByTestId("hero-marketing-image");
    const firstContainer = images[0].closest("div");
    const secondContainer = images[1].closest("div");
    const thirdContainer = images[2].closest("div");
    const dot3 = screen.getByLabelText("Go to image 3");

    // Click on third dot
    fireEvent.click(dot3);

    // Third image container should be visible
    expect(firstContainer).toHaveClass("opacity-0");
    expect(secondContainer).toHaveClass("opacity-0");
    expect(thirdContainer).toHaveClass("opacity-100");

    // Restore
    import.meta.env.VITE_HERO_IMAGES = originalEnv;
  });
});
