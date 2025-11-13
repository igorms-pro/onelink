import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeaderMobileSignIn } from "../HeaderMobileSignIn";

// Mock child components
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock("../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

describe("HeaderMobileSignIn", () => {
  it("renders theme and language toggles", () => {
    render(<HeaderMobileSignIn />);

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("renders header element", () => {
    const { container } = render(<HeaderMobileSignIn />);
    const header = container.querySelector("header");

    expect(header).toBeInTheDocument();
  });
});
