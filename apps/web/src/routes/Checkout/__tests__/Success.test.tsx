import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock dependencies BEFORE imports
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const translations: Record<string, string> = {
          "checkout_success.title": "You're in!",
          "checkout_success.subtitle": "Thanks for upgrading",
          "checkout_success.message": "Your subscription is active",
          "checkout_success.button": "Go to Dashboard",
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

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CheckoutSuccess from "../Success";
import "../../../lib/i18n";

describe("CheckoutSuccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders success page with title and subtitle", () => {
    render(
      <MemoryRouter>
        <CheckoutSuccess />
      </MemoryRouter>,
    );

    expect(screen.getByText(/you're in!/i)).toBeInTheDocument();
    expect(screen.getByText(/thanks for upgrading/i)).toBeInTheDocument();
  });

  it("renders success message", () => {
    render(
      <MemoryRouter>
        <CheckoutSuccess />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/your subscription is active/i),
    ).toBeInTheDocument();
  });

  it("renders go to dashboard button", () => {
    render(
      <MemoryRouter>
        <CheckoutSuccess />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /go to dashboard/i }),
    ).toBeInTheDocument();
  });

  it("navigates to dashboard when button is clicked", () => {
    render(
      <MemoryRouter>
        <CheckoutSuccess />
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: /go to dashboard/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("renders with green success styling", () => {
    render(
      <MemoryRouter>
        <CheckoutSuccess />
      </MemoryRouter>,
    );

    const container = screen.getByText(/you're in!/i).closest("div");
    expect(container).toHaveClass(/bg-green/i);
  });
});
