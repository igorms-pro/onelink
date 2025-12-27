import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
