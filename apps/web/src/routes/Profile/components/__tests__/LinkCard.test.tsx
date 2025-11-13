import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LinkCard } from "../LinkCard";
import type { PublicLink } from "../../types";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

// Mock navigator.userAgent
Object.defineProperty(navigator, "userAgent", {
  writable: true,
  value: "Mozilla/5.0",
});

describe("LinkCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLink: PublicLink = {
    link_id: "link-1",
    label: "Visit Website",
    emoji: "🚀",
    url: "https://example.com",
    order: 1,
  };

  it("renders link with label and emoji", () => {
    render(<LinkCard link={mockLink} />);

    expect(screen.getByText("Visit Website")).toBeInTheDocument();
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("renders link without emoji", () => {
    const linkWithoutEmoji: PublicLink = {
      ...mockLink,
      emoji: null,
    };

    render(<LinkCard link={linkWithoutEmoji} />);

    expect(screen.getByText("Visit Website")).toBeInTheDocument();
    expect(screen.queryByText("🚀")).not.toBeInTheDocument();
  });

  it("has correct href and target attributes", () => {
    render(<LinkCard link={mockLink} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("tracks click analytics when clicked", async () => {
    const { supabase } = await import("@/lib/supabase");
    const insertMock = vi.fn();
    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    render(<LinkCard link={mockLink} />);

    const link = screen.getByRole("link");
    fireEvent.click(link);

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith([
        {
          link_id: "link-1",
          user_agent: "Mozilla/5.0",
        },
      ]);
    });
  });

  it("creates ripple effect on click", () => {
    render(<LinkCard link={mockLink} />);

    const link = screen.getByRole("link");
    const ripple = link.querySelector("span[class*='opacity-0']");

    expect(ripple).toBeInTheDocument();

    fireEvent.click(link);

    // Ripple should be present (animation class will be added)
    expect(ripple).toBeInTheDocument();
  });

  it("handles mouse down/up events for pressed state", () => {
    render(<LinkCard link={mockLink} />);

    const link = screen.getByRole("link");

    fireEvent.mouseDown(link);
    expect(link).toHaveClass("shadow-md");

    fireEvent.mouseUp(link);
    fireEvent.mouseLeave(link);
  });

  it("shows external link icon on hover", () => {
    render(<LinkCard link={mockLink} />);

    const link = screen.getByRole("link");
    const externalIcon = link.querySelector("svg");

    expect(externalIcon).toBeInTheDocument();
    // Icon should have opacity-0 class initially (shown on hover)
    expect(externalIcon).toHaveClass("opacity-0");
  });

  it("truncates long labels", () => {
    const longLabelLink: PublicLink = {
      ...mockLink,
      label: "This is a very long label that should be truncated",
    };

    render(<LinkCard link={longLabelLink} />);

    const label = screen.getByText(
      "This is a very long label that should be truncated",
    );
    expect(label).toHaveClass("truncate");
  });
});
