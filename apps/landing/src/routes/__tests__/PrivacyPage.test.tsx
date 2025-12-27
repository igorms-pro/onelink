import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import PrivacyPage from "../PrivacyPage";

const renderWithHelmet = (component: React.ReactElement) => {
  return render(<HelmetProvider>{component}</HelmetProvider>);
};

describe("PrivacyPage", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: "",
    } as Location;

    delete import.meta.env.VITE_APP_URL;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
    delete import.meta.env.VITE_APP_URL;
  });

  it("renders redirecting message", () => {
    renderWithHelmet(<PrivacyPage />);

    expect(
      screen.getByText(/Redirecting to Privacy Policy/i),
    ).toBeInTheDocument();
  });

  it("redirects to app privacy page", () => {
    renderWithHelmet(<PrivacyPage />);

    // Should redirect to default URL
    expect(window.location.href).toBe("https://app.getonelink.io/privacy");
  });

  it("renders SEO component with correct title and description", async () => {
    renderWithHelmet(<PrivacyPage />);

    // Wait for Helmet to update document title
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check that SEO component is rendered (it sets document title)
    expect(document.title).toContain("Privacy Policy");
  });

  it("has correct page structure", () => {
    const { container } = renderWithHelmet(<PrivacyPage />);

    const mainDiv = container.querySelector(".min-h-screen");
    expect(mainDiv).toBeInTheDocument();
  });

  it("executes redirect in useEffect", () => {
    const initialHref = window.location.href;
    renderWithHelmet(<PrivacyPage />);

    // useEffect should execute and redirect
    expect(window.location.href).not.toBe(initialHref);
  });
});
