import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "../SEO";
import React from "react";

const renderWithHelmet = (component: React.ReactElement) => {
  return render(<HelmetProvider>{component}</HelmetProvider>);
};

describe("SEO Component", () => {
  beforeEach(() => {
    // Clear any existing meta tags
    document.head.innerHTML = "";
    document.title = "";
  });

  afterEach(() => {
    // Clean up
    document.head.innerHTML = "";
    document.title = "";
  });

  it("sets document title correctly", async () => {
    renderWithHelmet(<SEO title="Test Page" description="Test description" />);

    // Wait for Helmet to update the document
    await waitFor(() => {
      expect(document.title).toBe("Test Page | OneLink");
    });
  });

  it("sets meta description correctly", async () => {
    renderWithHelmet(<SEO title="Test Page" description="Test description" />);

    await waitFor(() => {
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute("content", "Test description");
    });
  });

  it("sets Open Graph tags", async () => {
    renderWithHelmet(
      <SEO
        title="Test Page"
        description="Test description"
        image="https://example.com/image.png"
        url="https://example.com/test"
      />,
    );

    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:type"]'),
      ).toHaveAttribute("content", "website");
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        "content",
        "https://example.com/test",
      );
      expect(
        document.querySelector('meta[property="og:title"]'),
      ).toHaveAttribute("content", "Test Page | OneLink");
      expect(
        document.querySelector('meta[property="og:description"]'),
      ).toHaveAttribute("content", "Test description");
      expect(
        document.querySelector('meta[property="og:image"]'),
      ).toHaveAttribute("content", "https://example.com/image.png");
    });
  });

  it("sets Twitter Card tags", async () => {
    renderWithHelmet(
      <SEO
        title="Test Page"
        description="Test description"
        image="https://example.com/image.png"
        url="https://example.com/test"
      />,
    );

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"]'),
      ).toHaveAttribute("content", "summary_large_image");
      expect(
        document.querySelector('meta[name="twitter:url"]'),
      ).toHaveAttribute("content", "https://example.com/test");
      expect(
        document.querySelector('meta[name="twitter:title"]'),
      ).toHaveAttribute("content", "Test Page | OneLink");
      expect(
        document.querySelector('meta[name="twitter:description"]'),
      ).toHaveAttribute("content", "Test description");
      expect(
        document.querySelector('meta[name="twitter:image"]'),
      ).toHaveAttribute("content", "https://example.com/image.png");
    });
  });

  it("sets canonical URL", async () => {
    renderWithHelmet(<SEO title="Test Page" url="https://example.com/test" />);

    await waitFor(() => {
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toBeInTheDocument();
      expect(canonical).toHaveAttribute("href", "https://example.com/test");
    });
  });

  it("handles missing props gracefully", async () => {
    renderWithHelmet(<SEO />);

    // Should use default values
    await waitFor(() => {
      expect(document.title).toBe("OneLink. Multiple lives.");

      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute(
        "content",
        "Share your links, files, and drops with one simple link. No more messy bios or multiple links.",
      );
    });
  });

  it("uses default SEO values when props are not provided", async () => {
    renderWithHelmet(<SEO />);

    await waitFor(() => {
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        "content",
        "https://getonelink.io",
      );
      expect(
        document.querySelector('meta[property="og:image"]'),
      ).toHaveAttribute("content", "https://getonelink.io/og.png");
    });
  });

  it("formats title with site name when title is provided", async () => {
    renderWithHelmet(<SEO title="Custom Title" />);

    await waitFor(() => {
      expect(document.title).toBe("Custom Title | OneLink");
    });
  });

  it("renders children correctly", () => {
    const { container } = renderWithHelmet(
      <SEO title="Test">
        <div data-testid="child">Child content</div>
      </SEO>,
    );

    expect(
      container.querySelector('[data-testid="child"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child"]')).toHaveTextContent(
      "Child content",
    );
  });

  it("sets og:site_name correctly", async () => {
    renderWithHelmet(<SEO title="Test Page" />);

    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:site_name"]'),
      ).toHaveAttribute("content", "OneLink");
    });
  });

  it("sets og:locale correctly", async () => {
    renderWithHelmet(<SEO title="Test Page" />);

    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:locale"]'),
      ).toHaveAttribute("content", "en");
    });
  });
});
