import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentTab } from "../ContentTab";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow } from "../../types";

// Mock child components
vi.mock("../LinksSection", () => ({
  LinksSection: ({
    profileId,
    links,
    setLinks: _setLinks,
    drops: _drops,
    isFree,
    freeLimit,
  }: any) => (
    <div data-testid="links-section">
      Links Section - Profile: {profileId}, Links: {links.length}, Free:{" "}
      {String(isFree)}, Limit: {freeLimit}
    </div>
  ),
}));

vi.mock("../DropsSection", () => ({
  DropsSection: ({
    profileId,
    drops,
    setDrops: _setDrops,
    links: _links,
    isFree,
    freeLimit,
  }: any) => (
    <div data-testid="drops-section">
      Drops Section - Profile: {profileId}, Drops: {drops.length}, Free:{" "}
      {String(isFree)}, Limit: {freeLimit}
    </div>
  ),
}));

describe("ContentTab", () => {
  const mockLinks: LinkRow[] = [
    {
      id: "link-1",
      label: "Link 1",
      emoji: "🚀",
      url: "https://example.com",
      order: 1,
    },
  ];
  const mockDrops: DropRow[] = [
    {
      id: "drop-1",
      label: "Drop 1",
      emoji: "📁",
      order: 1,
      is_active: true,
      is_public: true,
      share_token: "token-123",
    },
  ];
  const mockSetLinks = vi.fn();
  const mockSetDrops = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render LinksSection and DropsSection", () => {
    render(
      <ContentTab
        profileId="profile-1"
        links={mockLinks}
        setLinks={mockSetLinks}
        drops={mockDrops}
        setDrops={mockSetDrops}
        isFree={true}
        freeLinksLimit={4}
        freeDropsLimit={2}
      />,
    );

    expect(screen.getByTestId("links-section")).toBeInTheDocument();
    expect(screen.getByTestId("drops-section")).toBeInTheDocument();
  });

  it("should pass correct props to LinksSection", () => {
    render(
      <ContentTab
        profileId="profile-1"
        links={mockLinks}
        setLinks={mockSetLinks}
        drops={mockDrops}
        setDrops={mockSetDrops}
        isFree={true}
        freeLinksLimit={4}
        freeDropsLimit={2}
      />,
    );

    const linksSection = screen.getByTestId("links-section");
    expect(linksSection).toHaveTextContent("Profile: profile-1");
    expect(linksSection).toHaveTextContent("Links: 1");
    expect(linksSection).toHaveTextContent("Free: true");
    expect(linksSection).toHaveTextContent("Limit: 4");
  });

  it("should pass correct props to DropsSection", () => {
    render(
      <ContentTab
        profileId="profile-1"
        links={mockLinks}
        setLinks={mockSetLinks}
        drops={mockDrops}
        setDrops={mockSetDrops}
        isFree={false}
        freeLinksLimit={4}
        freeDropsLimit={2}
      />,
    );

    const dropsSection = screen.getByTestId("drops-section");
    expect(dropsSection).toHaveTextContent("Profile: profile-1");
    expect(dropsSection).toHaveTextContent("Drops: 1");
    expect(dropsSection).toHaveTextContent("Free: false");
    expect(dropsSection).toHaveTextContent("Limit: 2");
  });

  it("should handle null profileId", () => {
    render(
      <ContentTab
        profileId={null}
        links={[]}
        setLinks={mockSetLinks}
        drops={[]}
        setDrops={mockSetDrops}
        isFree={true}
        freeLinksLimit={4}
        freeDropsLimit={2}
      />,
    );

    // When profileId is null, it renders as empty string in the mock
    expect(screen.getByTestId("links-section")).toHaveTextContent("Profile:");
    expect(screen.getByTestId("drops-section")).toHaveTextContent("Profile:");
  });

  it("should handle empty links and drops arrays", () => {
    render(
      <ContentTab
        profileId="profile-1"
        links={[]}
        setLinks={mockSetLinks}
        drops={[]}
        setDrops={mockSetDrops}
        isFree={true}
        freeLinksLimit={4}
        freeDropsLimit={2}
      />,
    );

    expect(screen.getByTestId("links-section")).toHaveTextContent("Links: 0");
    expect(screen.getByTestId("drops-section")).toHaveTextContent("Drops: 0");
  });
});
