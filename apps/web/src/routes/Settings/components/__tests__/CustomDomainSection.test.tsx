import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CustomDomainSection } from "../CustomDomainSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CustomDomainSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    renderWithRouter(<CustomDomainSection />);
    expect(
      screen.getByTestId("settings-custom-domain-section"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_custom_domain")).toBeInTheDocument();
  });

  it("renders configure domain button", () => {
    renderWithRouter(<CustomDomainSection />);
    expect(
      screen.getByTestId("settings-custom-domain-configure"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_configure_domain")).toBeInTheDocument();
  });

  it("displays help text", () => {
    renderWithRouter(<CustomDomainSection />);
    expect(screen.getByText("settings_domain_help")).toBeInTheDocument();
  });

  it("navigates to domain page when configure button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CustomDomainSection />);
    const configureButton = screen.getByTestId(
      "settings-custom-domain-configure",
    );
    await user.click(configureButton);
    expect(mockNavigate).toHaveBeenCalledWith("/settings/domain");
  });
});
