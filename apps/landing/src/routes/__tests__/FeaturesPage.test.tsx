import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import FeaturesPage from "../FeaturesPage";

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </HelmetProvider>,
  );
};

describe("FeaturesPage Component", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("renders hero section", () => {
    renderWithRouter(<FeaturesPage />);

    // Hero section should have main heading (use getAllByText since it may appear multiple times)
    expect(screen.getAllByText("Powerful Features").length).toBeGreaterThan(0);

    // Should have subheading (use getAllByText since it may appear multiple times)
    expect(
      screen.getAllByText(/Everything you need to share your content/i).length,
    ).toBeGreaterThan(0);
  });

  it("renders FeaturesSection", () => {
    renderWithRouter(<FeaturesPage />);

    // FeaturesSection should render feature cards
    // Look for feature titles from FeaturesSection (use getAllByText since it appears multiple times)
    expect(screen.getAllByText(/One Link/i).length).toBeGreaterThan(0);
  });

  it("renders detailed features", () => {
    renderWithRouter(<FeaturesPage />);

    // Should have detailed feature sections with titles
    // These come from the features array in FeaturesPage
    // Use getAllByText since some text appears multiple times
    expect(screen.getAllByText(/One Link/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/File Sharing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Customizable/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Privacy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);
  });

  it("screenshot placeholders render", () => {
    renderWithRouter(<FeaturesPage />);

    // Should have screenshot placeholders
    const placeholders = screen.getAllByText(/SCREENSHOT:/i);
    expect(placeholders.length).toBeGreaterThan(0);

    // Check that placeholders have correct structure
    placeholders.forEach((placeholder) => {
      expect(placeholder).toBeInTheDocument();
      expect(placeholder.textContent).toMatch(/SCREENSHOT:/i);
    });
  });

  it("SEO meta tags are set", async () => {
    const { waitFor } = await import("@testing-library/react");
    renderWithRouter(<FeaturesPage />);

    // Wait for Helmet to update the document
    await waitFor(() => {
      expect(document.title).toContain("Features");
    });

    // Check for meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeInTheDocument();
    expect(metaDescription?.getAttribute("content")).toContain(
      "Discover all the powerful features OneLink offers",
    );
  });

  it("responsive layout works", () => {
    const { container } = renderWithRouter(<FeaturesPage />);

    // Check for responsive classes (use getAllByText since "Powerful Features" appears multiple times)
    const heroHeadings = screen.getAllByText("Powerful Features");
    const heroSection = heroHeadings[0].closest("section");
    expect(heroSection).toHaveClass("py-16", "sm:py-20", "lg:py-24");

    // Check detailed features section has responsive grid
    const detailedSection = container.querySelector(
      '[class*="lg:grid-cols-2"]',
    );
    expect(detailedSection).toBeInTheDocument();
  });

  it("renders Header and Footer", () => {
    renderWithRouter(<FeaturesPage />);

    // Header should be present - use getAllByText since these appear multiple times
    expect(screen.getAllByText("Features").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pricing").length).toBeGreaterThan(0);

    // Footer should be present
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = renderWithRouter(<FeaturesPage />);

    // Check main structure
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();

    // Check that page has min-h-screen
    const pageContainer = container.querySelector(".min-h-screen");
    expect(pageContainer).toBeInTheDocument();
  });

  it("renders all 6 features with details", () => {
    renderWithRouter(<FeaturesPage />);

    // Check that all 6 features are rendered with their details
    const featureTitles = [
      /One Link/i,
      /File Sharing/i,
      /Notifications/i,
      /Customizable/i,
      /Privacy/i,
      /Analytics/i,
    ];

    featureTitles.forEach((title) => {
      // Use getAllByText since some text appears multiple times
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });

    // Check that feature details (bullets) are rendered
    // Each feature should have detail items
    const checkmarks = document.querySelectorAll('svg[viewBox="0 0 24 24"]');
    // Should have multiple checkmarks (one per detail item)
    expect(checkmarks.length).toBeGreaterThan(6);
  });

  it("features alternate layout correctly", () => {
    const { container } = renderWithRouter(<FeaturesPage />);

    // Features should alternate order (odd index features have lg:order-2)
    const featureGrids = container.querySelectorAll(
      '[class*="lg:grid-cols-2"]',
    );

    // Should have 6 feature grids
    expect(featureGrids.length).toBeGreaterThanOrEqual(6);

    // Check that alternating order classes are applied
    const oddIndexFeatures = container.querySelectorAll(
      '[class*="lg:order-2"]',
    );
    // Some features should have order-2 class
    expect(oddIndexFeatures.length).toBeGreaterThan(0);
  });

  it("renders feature icons correctly", () => {
    renderWithRouter(<FeaturesPage />);

    // Each feature should have an icon container
    const iconContainers = document.querySelectorAll(
      '[class*="bg-purple-100"]',
    );
    expect(iconContainers.length).toBeGreaterThanOrEqual(6);
  });
});
