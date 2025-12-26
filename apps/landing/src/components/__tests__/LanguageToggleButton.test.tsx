import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageToggleButton } from "../LanguageToggleButton";

// Mock LanguageDropdown
vi.mock("../language/LanguageDropdown", () => ({
  LanguageDropdown: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <div data-testid="language-dropdown" data-open={isOpen}>
      {isOpen && (
        <button onClick={onClose} data-testid="close-dropdown">
          Close
        </button>
      )}
    </div>
  ),
}));

// Mock languages data
vi.mock("@/data/languages", () => ({
  languages: [
    { code: "EN", name: "English", flag: "🇬🇧" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
  ],
}));

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  setLanguage: vi.fn(),
}));

describe("LanguageToggleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the language toggle button", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");
    expect(button).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "false",
    );

    fireEvent.click(button);

    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("closes dropdown when button is clicked again", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");

    // Open
    fireEvent.click(button);
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );

    // Close
    fireEvent.click(button);
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("closes dropdown when clicking outside", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");

    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("does not close dropdown when clicking inside", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");

    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );

    // Click inside dropdown
    const dropdown = screen.getByTestId("language-dropdown");
    fireEvent.mouseDown(dropdown);

    // Should still be open
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("uses language from localStorage if i18n.language is not set", () => {
    localStorage.setItem("lang", "fr");
    render(<LanguageToggleButton />);

    // Component should render without errors
    expect(screen.getByLabelText("Change language")).toBeInTheDocument();
  });

  it("closes dropdown when close button is clicked", () => {
    render(<LanguageToggleButton />);

    const button = screen.getByLabelText("Change language");

    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "true",
    );

    // Click close button
    const closeButton = screen.getByTestId("close-dropdown");
    fireEvent.click(closeButton);

    expect(screen.getByTestId("language-dropdown")).toHaveAttribute(
      "data-open",
      "false",
    );
  });
});
