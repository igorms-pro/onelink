import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Footer } from "../Footer";

// Mock ThemeToggleButton and ProfileLanguageToggleButton
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button>Theme</button>,
}));

vi.mock("@/routes/Profile/components/ProfileLanguageToggleButton", () => ({
  ProfileLanguageToggleButton: () => <button>Language</button>,
}));

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { year?: number; defaultValue?: string }) => {
        if (key === "footer_all_rights" && options?.year) {
          return (
            options.defaultValue ||
            `© ${options.year} OneLink. All rights reserved.`
          );
        }
        if (key === "footer_brand_name") {
          return options?.defaultValue || "OneLink";
        }
        return key;
      },
    }),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Footer", () => {
  it("renders brand name", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("OneLink")).toBeInTheDocument();
  });

  it("renders privacy link", () => {
    renderWithRouter(<Footer />);
    const privacyLink = screen.getByRole("link", { name: /footer_privacy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("renders terms link", () => {
    renderWithRouter(<Footer />);
    const termsLink = screen.getByRole("link", { name: /footer_terms/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("does not show branding by default", () => {
    renderWithRouter(<Footer />);
    expect(screen.queryByText(/footer_powered/i)).not.toBeInTheDocument();
  });

  it("shows branding when showBranding is true with brandingText", () => {
    renderWithRouter(
      <Footer showBranding brandingText="Un lien. Plusieurs vies." />,
    );
    // Should show logo + slogan instead of brand name
    expect(screen.getByText("Un lien. Plusieurs vies.")).toBeInTheDocument();
    // There are two images (light and dark mode), so use getAllByAltText
    expect(screen.getAllByAltText("OneLink").length).toBeGreaterThan(0);
    // Should not show "OneLink" text when branding is shown
    expect(screen.queryByText("OneLink")).not.toBeInTheDocument();
  });

  it("shows custom branding text when provided", () => {
    renderWithRouter(<Footer showBranding brandingText="Custom branding" />);
    expect(screen.getByText("Custom branding")).toBeInTheDocument();
    // There are two images (light and dark mode), so use getAllByAltText
    expect(screen.getAllByAltText("OneLink").length).toBeGreaterThan(0);
    expect(screen.queryByText("OneLink")).not.toBeInTheDocument();
  });

  it("shows brand name when showBranding is true but no brandingText", () => {
    renderWithRouter(<Footer showBranding />);
    // Without brandingText, should fallback to brand name
    expect(screen.getByText("OneLink")).toBeInTheDocument();
    expect(screen.queryByAltText("OneLink")).not.toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    const { container } = renderWithRouter(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("mt-auto", "w-full");
  });

  it("applies transparent variant styles", () => {
    const { container } = renderWithRouter(<Footer variant="transparent" />);
    const footer = container.querySelector("footer > div");
    expect(footer).toHaveClass(
      "border-transparent",
      "bg-transparent",
      "backdrop-blur-0",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithRouter(<Footer className="custom-class" />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("custom-class");
  });

  it("renders links with hover styles", () => {
    renderWithRouter(<Footer />);
    const privacyLink = screen.getByRole("link", { name: /footer_privacy/i });
    expect(privacyLink).toHaveClass("hover:text-purple-600");
  });
});
