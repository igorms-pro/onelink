import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { LegalPageLayout } from "../LegalPageLayout";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      exists: () => false,
    },
  }),
}));

// Mock ThemeToggleButton and LanguageToggleButton
vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button data-testid="theme-toggle">Theme</button>,
}));

vi.mock("../LanguageToggleButton", () => ({
  LanguageToggleButton: () => (
    <button data-testid="language-toggle">Language</button>
  ),
}));

const mockSections = [
  {
    id: "section-1",
    title: "Section 1",
    paragraphs: ["Paragraph 1", "Paragraph 2"],
  },
  {
    id: "section-2",
    title: "Section 2",
    items: ["Item 1", "Item 2", "Item 3"],
  },
  {
    id: "section-3",
    title: "Section 3",
    paragraphs: ["Paragraph 3"],
    items: ["Item 4"],
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LegalPageLayout", () => {
  it("renders the title", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders the description", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("renders all sections", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
    expect(screen.getByText("Section 3")).toBeInTheDocument();
  });

  it("renders paragraphs in sections", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 3")).toBeInTheDocument();
  });

  it("renders items as list in sections", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
  });

  it("renders back button", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    const backButton = screen.getByTestId("legal-back-button");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent("back");
  });

  it("renders sticky header with logo", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    const header = screen.getByTestId("legal-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("sticky", "top-0");
    expect(screen.getByTestId("legal-header-logo-link")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("header logo link navigates to home", () => {
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    const logoLink = screen.getByTestId("legal-header-logo-link");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("back button is clickable", async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );

    const backButton = screen.getByTestId("legal-back-button");
    expect(backButton).toBeInTheDocument();
    await user.click(backButton);
    // Button should be clickable (actual navigation tested in E2E)
  });

  it("applies custom className", () => {
    const { container } = renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
        className="custom-class"
      />,
    );
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("custom-class");
  });

  it("renders sections with scroll-mt-24 class for anchor navigation", () => {
    const { container } = renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={mockSections}
      />,
    );
    const sections = container.querySelectorAll("section");
    sections.forEach((section) => {
      expect(section).toHaveClass("scroll-mt-24");
    });
  });

  it("handles sections with only paragraphs", () => {
    const sectionsWithOnlyParagraphs = [
      {
        id: "section-1",
        title: "Section 1",
        paragraphs: ["Paragraph 1"],
      },
    ];
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={sectionsWithOnlyParagraphs}
      />,
    );
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("handles sections with only items", () => {
    const sectionsWithOnlyItems = [
      {
        id: "section-1",
        title: "Section 1",
        items: ["Item 1"],
      },
    ];
    renderWithRouter(
      <LegalPageLayout
        title="Test Title"
        description="Test Description"
        lastUpdated="2024-01-01"
        sections={sectionsWithOnlyItems}
      />,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Paragraph")).not.toBeInTheDocument();
  });
});
