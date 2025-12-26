import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageDropdown } from "../LanguageDropdown";
import * as i18n from "@/lib/i18n";

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  setLanguage: vi.fn(),
}));

const mockLanguages = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "FR", name: "Français", flag: "🇫🇷", langCode: "fr" },
  { code: "PT", name: "Português", flag: "🇵🇹", langCode: "pt" },
];

describe("LanguageDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <LanguageDropdown
        isOpen={false}
        currentLangCode="en"
        onLanguageSelect={vi.fn()}
        onClose={vi.fn()}
        languages={mockLanguages}
      />,
    );

    expect(screen.queryByText("EN")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="en"
        onLanguageSelect={vi.fn()}
        onClose={vi.fn()}
        languages={mockLanguages}
      />,
    );

    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
    expect(screen.getByText("PT")).toBeInTheDocument();
  });

  it("renders all languages with flags", () => {
    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="en"
        onLanguageSelect={vi.fn()}
        onClose={vi.fn()}
        languages={mockLanguages}
      />,
    );

    mockLanguages.forEach((lang) => {
      expect(screen.getByText(lang.code)).toBeInTheDocument();
    });
  });

  it("highlights current language", () => {
    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="fr"
        onLanguageSelect={vi.fn()}
        onClose={vi.fn()}
        languages={mockLanguages}
      />,
    );

    const frButton = screen.getByText("FR").closest("button");
    expect(frButton).toHaveClass("bg-gray-100");
  });

  it("calls setLanguage and onLanguageSelect when language is clicked", () => {
    const onLanguageSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="en"
        onLanguageSelect={onLanguageSelect}
        onClose={onClose}
        languages={mockLanguages}
      />,
    );

    const frButton = screen.getByText("FR").closest("button");
    fireEvent.click(frButton!);

    expect(i18n.setLanguage).toHaveBeenCalledWith("fr");
    expect(onLanguageSelect).toHaveBeenCalledWith("fr");
    expect(onClose).toHaveBeenCalled();
  });

  it("uses langCode when available, otherwise uses code.toLowerCase()", () => {
    const onLanguageSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="en"
        onLanguageSelect={onLanguageSelect}
        onClose={onClose}
        languages={mockLanguages}
      />,
    );

    // EN doesn't have langCode, so should use "en"
    const enButton = screen.getByText("EN").closest("button");
    fireEvent.click(enButton!);

    expect(i18n.setLanguage).toHaveBeenCalledWith("en");
    expect(onLanguageSelect).toHaveBeenCalledWith("en");

    // FR has langCode "fr"
    const frButton = screen.getByText("FR").closest("button");
    fireEvent.click(frButton!);

    expect(i18n.setLanguage).toHaveBeenCalledWith("fr");
  });

  it("applies correct styling to non-selected languages", () => {
    render(
      <LanguageDropdown
        isOpen={true}
        currentLangCode="en"
        onLanguageSelect={vi.fn()}
        onClose={vi.fn()}
        languages={mockLanguages}
      />,
    );

    const frButton = screen.getByText("FR").closest("button");
    expect(frButton).toHaveClass("text-gray-700");
    expect(frButton).not.toHaveClass("bg-gray-100");
  });
});
