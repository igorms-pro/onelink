import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HeaderMobileDashboard } from "../HeaderMobileDashboard";

// Mock child components
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock("../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      exists: (key: string) => key === "app_title",
    },
  }),
}));

describe("HeaderMobileDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo", () => {
    render(
      <MemoryRouter>
        <HeaderMobileDashboard />
      </MemoryRouter>,
    );

    const logos = screen.getAllByAltText("OneLink");
    expect(logos).toHaveLength(2); // One for light mode, one for dark mode
    expect(logos[0]).toBeInTheDocument();
  });

  it("renders theme and language toggles when onSettingsClick is provided", () => {
    render(
      <MemoryRouter>
        <HeaderMobileDashboard onSettingsClick={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("renders settings button when onSettingsClick is provided", () => {
    const onSettingsClick = vi.fn();

    render(
      <MemoryRouter>
        <HeaderMobileDashboard onSettingsClick={onSettingsClick} />
      </MemoryRouter>,
    );

    const settingsButton = screen.getByLabelText("Settings");
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(onSettingsClick).toHaveBeenCalled();
  });

  it("does not render settings controls when onSettingsClick is not provided", () => {
    render(
      <MemoryRouter>
        <HeaderMobileDashboard />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("theme-toggle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("language-toggle")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Settings")).not.toBeInTheDocument();
  });

  it("links to home page when logo is clicked", () => {
    render(
      <MemoryRouter>
        <HeaderMobileDashboard />
      </MemoryRouter>,
    );

    const logos = screen.getAllByAltText("OneLink");
    const logoLink = logos[0].closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
