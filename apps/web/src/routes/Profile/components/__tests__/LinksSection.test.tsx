import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LinksSection } from "../LinksSection";
import type { PublicLink } from "../../types";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("LinksSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLinks: PublicLink[] = [
    {
      link_id: "link-1",
      label: "Regular Link",
      emoji: "🔗",
      url: "https://example.com",
      order: 1,
    },
    {
      link_id: "link-2",
      label: "Another Link",
      emoji: null,
      url: "https://test.com",
      order: 2,
    },
  ];

  const socialLinks: PublicLink[] = [
    {
      link_id: "link-social",
      label: "Instagram",
      emoji: null,
      url: "https://instagram.com/test",
      order: 1,
    },
  ];

  it("renders section with links", () => {
    render(<LinksSection links={mockLinks} />);

    expect(screen.getByText("profile_section_routes")).toBeInTheDocument();
    expect(screen.getByText("Regular Link")).toBeInTheDocument();
    expect(screen.getByText("Another Link")).toBeInTheDocument();
  });

  it("does not render when links array is empty", () => {
    const { container } = render(<LinksSection links={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("filters out social links", () => {
    const allLinks = [...mockLinks, ...socialLinks];

    render(<LinksSection links={allLinks} />);

    expect(screen.getByText("Regular Link")).toBeInTheDocument();
    expect(screen.getByText("Another Link")).toBeInTheDocument();
    expect(screen.queryByText("Instagram")).not.toBeInTheDocument();
  });

  it("does not render when only social links are provided", () => {
    const { container } = render(<LinksSection links={socialLinks} />);
    expect(container.firstChild).toBeNull();
  });

  it("expands and collapses section", () => {
    render(<LinksSection links={mockLinks} />);

    const toggleButton = screen.getByRole("button");
    const section = screen
      .getByText("profile_section_routes")
      .closest("section");

    // Initially expanded
    expect(section?.querySelector("div[class*='grid']")).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggleButton);
    expect(
      section?.querySelector("div[class*='grid']"),
    ).not.toBeInTheDocument();

    // Expand again
    fireEvent.click(toggleButton);
    expect(section?.querySelector("div[class*='grid']")).toBeInTheDocument();
  });

  it("shows correct chevron icon based on expanded state", () => {
    render(<LinksSection links={mockLinks} />);

    const toggleButton = screen.getByRole("button");
    // Initially expanded - should show ChevronUp
    expect(screen.getByTestId("links-section-chevron-up")).toBeInTheDocument();
    expect(
      screen.queryByTestId("links-section-chevron-down"),
    ).not.toBeInTheDocument();

    // Collapse - should show ChevronDown
    fireEvent.click(toggleButton);
    expect(
      screen.getByTestId("links-section-chevron-down"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("links-section-chevron-up"),
    ).not.toBeInTheDocument();
  });

  it("renders LinkCard components for each non-social link", () => {
    render(<LinksSection links={mockLinks} />);

    // LinkCard components should be rendered (they're anchor tags)
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
