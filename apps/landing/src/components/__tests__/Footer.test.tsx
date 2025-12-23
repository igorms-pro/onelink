import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Footer } from "../Footer";
import React from "react";

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Footer Component", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("renders all footer sections", () => {
    renderWithRouter(<Footer />);

    // Check for section headings
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Social")).toBeInTheDocument();
    expect(screen.getByText("App")).toBeInTheDocument();
  });

  it("all links are correct", () => {
    renderWithRouter(<Footer />);

    // Product links
    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveAttribute("href", "/features");

    const pricingLink = screen.getByText("Pricing");
    expect(pricingLink).toHaveAttribute("href", "/pricing");

    // Legal links
    const privacyLink = screen.getByText("Privacy Policy");
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByText("Terms of Service");
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("social links work", () => {
    renderWithRouter(<Footer />);

    // Check for social media links
    const twitterLink = screen.getByLabelText("Twitter");
    expect(twitterLink).toHaveAttribute(
      "href",
      "https://twitter.com/getonelink",
    );
    expect(twitterLink).toHaveAttribute("target", "_blank");
    expect(twitterLink).toHaveAttribute("rel", "noopener noreferrer");

    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toHaveAttribute("href", "https://github.com/getonelink");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    const linkedinLink = screen.getByLabelText("LinkedIn");
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://linkedin.com/company/getonelink",
    );
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("legal links point to correct pages", () => {
    renderWithRouter(<Footer />);

    const privacyLink = screen.getByText("Privacy Policy");
    expect(privacyLink.closest("a")).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByText("Terms of Service");
    expect(termsLink.closest("a")).toHaveAttribute("href", "/terms");
  });

  it("copyright year is current", () => {
    renderWithRouter(<Footer />);

    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(
      new RegExp(`© ${currentYear} OneLink. All rights reserved.`),
    );
    expect(copyrightText).toBeInTheDocument();
  });

  it("is accessible", () => {
    renderWithRouter(<Footer />);

    // All links should be accessible
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    // Social links should have aria-labels
    expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("renders contact email link", () => {
    renderWithRouter(<Footer />);

    const contactLink = screen.getByText("Contact");
    expect(contactLink).toHaveAttribute(
      "href",
      "mailto:support@getonelink.app",
    );
  });

  it("renders app sign in and sign up links", () => {
    renderWithRouter(<Footer />);

    const signInLinks = screen.getAllByText("Sign In");
    expect(signInLinks.length).toBeGreaterThan(0);
    signInLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://app.getonelink.io/auth");
    });

    const signUpLinks = screen.getAllByText("Sign Up");
    expect(signUpLinks.length).toBeGreaterThan(0);
    signUpLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://app.getonelink.io/auth");
    });
  });

  it("has proper semantic structure", () => {
    renderWithRouter(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Should have section headings
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders correctly in dark mode", () => {
    document.documentElement.classList.add("dark");

    renderWithRouter(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("dark:bg-gray-950");
  });
});
