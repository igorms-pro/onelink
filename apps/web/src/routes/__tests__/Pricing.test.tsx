import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock dependencies BEFORE imports
const mockNavigate = vi.fn();

// Mock window.location
const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock("../../lib/billing", () => ({
  goToCheckout: vi.fn(),
}));

vi.mock("../../hooks/use-media-query", () => ({
  useMediaQuery: vi.fn(() => false), // Desktop by default
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pricing from "../Pricing";
import { goToCheckout } from "../../lib/billing";
import "../../lib/i18n";

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { returnObjects?: boolean }) => {
        if (options?.returnObjects) {
          if (key === "pricing.plans.free") {
            return {
              name: "Free",
              priceMonthly: "€0",
              priceYearly: "€0",
              description: "Free plan",
              cta: "Start for free",
              features: [
                "Unlimited routes",
                "Unlimited drops",
                "Basic analytics",
              ],
            };
          }
          if (key === "pricing.plans.starter") {
            return {
              name: "Starter",
              priceMonthly: "€6",
              priceYearly: "€58",
              description: "Starter plan",
              cta: "Get started",
              features: [
                "Unlimited routes",
                "Unlimited drops",
                "Custom domain",
              ],
            };
          }
          if (key === "pricing.plans.pro") {
            return {
              name: "Pro",
              priceMonthly: "€12",
              priceYearly: "€115",
              description: "Pro plan",
              cta: "Upgrade to Pro",
              features: [
                "Unlimited routes",
                "Unlimited drops",
                "Advanced analytics",
                "Custom domain",
              ],
            };
          }
          if (key === "pricing.faq") {
            return [
              { question: "Q1", answer: "A1" },
              { question: "Q2", answer: "A2" },
            ];
          }
          return {};
        }
        // Simple string translations
        const translations: Record<string, string> = {
          "pricing.title": "Plans & Pricing",
          "pricing.description": "Choose the plan",
          "pricing.monthly_label": "Monthly",
          "pricing.yearly_label": "Annually (save 20%)",
          "pricing.currency_note": "Prices in USD",
          "pricing.most_popular": "Most Popular",
          "pricing.per_month": "/month",
          "pricing.per_year": "/year",
          "pricing.includes": "Includes",
          "pricing.loading": "Redirecting...",
          "pricing.faq_title": "Frequently Asked Questions",
          "pricing.cta_title": "Still unsure?",
          "pricing.cta_button": "Create your OneLink",
        };
        return translations[key] || key;
      },
      i18n: {
        changeLanguage: vi.fn(),
        language: "en",
      },
    }),
    initReactI18next: {
      type: "3rdParty",
      init: vi.fn(),
    },
  };
});

describe("Pricing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(goToCheckout).mockResolvedValue(undefined);
  });

  it("renders pricing page with title and description", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/plans & pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/choose the plan/i)).toBeInTheDocument();
  });

  it("renders all three plans (free, starter, pro)", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("shows most popular badge on pro plan", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  });

  it("renders plan features for both plans", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    // Check that features are rendered (they come from i18n)
    const features = screen.getAllByText(/unlimited|routes|drops|analytics/i);
    expect(features.length).toBeGreaterThan(0);
  });

  it("navigates to auth when free plan button is clicked", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    // Free plan button should navigate to auth - the button text comes from i18n mock
    // Since the mock returns "Start for free", we should find it
    const freeButton = screen.getByRole("button", { name: "Start for free" });
    expect(freeButton).toBeInTheDocument();
    expect(freeButton).not.toBeDisabled();
    fireEvent.click(freeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  it("calls goToCheckout when pro plan button is clicked", async () => {
    vi.mocked(goToCheckout).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    const proButton = screen.getByRole("button", { name: /upgrade to pro/i });
    fireEvent.click(proButton);

    await waitFor(() => {
      expect(goToCheckout).toHaveBeenCalledWith("pro", "monthly");
    });
  });

  it("calls goToCheckout with yearly period when yearly is selected", async () => {
    vi.mocked(goToCheckout).mockResolvedValue(undefined);
    mockSearchParams.set("period", "yearly");

    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    const proButton = screen.getByRole("button", { name: /upgrade to pro/i });
    fireEvent.click(proButton);

    await waitFor(() => {
      expect(goToCheckout).toHaveBeenCalledWith("pro", "yearly");
    });
  });

  it("renders FAQ section", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
  });

  it("renders CTA section with create button", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/still unsure/i)).toBeInTheDocument();
    const ctaButton = screen.getByRole("button", {
      name: /create your onelink/i,
    });
    expect(ctaButton).toBeInTheDocument();
  });

  it("navigates to auth when CTA button is clicked", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    const ctaButton = screen.getByRole("button", {
      name: /create your onelink/i,
    });
    fireEvent.click(ctaButton);

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  it("displays monthly billing label", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    // Should show "Monthly" in the toggle
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });

  it("displays currency note", () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/prices in usd/i)).toBeInTheDocument();
  });
});
