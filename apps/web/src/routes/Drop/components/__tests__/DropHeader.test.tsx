import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropHeader } from "../DropHeader";
import type { DropWithVisibility } from "@/lib/drops";

const mockDrop: DropWithVisibility = {
  id: "drop-1",
  label: "Test Drop",
  emoji: "📁",
  order: 1,
  is_active: true,
  is_public: true,
  share_token: "token-123",
  max_file_size_mb: 50,
};

describe("DropHeader", () => {
  it("renders drop label", () => {
    render(<DropHeader drop={mockDrop} />);
    expect(screen.getByText("Test Drop")).toBeInTheDocument();
  });

  it("renders emoji when provided", () => {
    render(<DropHeader drop={mockDrop} />);
    expect(screen.getByText("📁")).toBeInTheDocument();
  });

  it("shows public badge when drop is public", () => {
    render(<DropHeader drop={mockDrop} />);
    expect(screen.getByText("🌐 Public")).toBeInTheDocument();
  });

  it("shows private badge when drop is private", () => {
    const privateDrop = { ...mockDrop, is_public: false };
    render(<DropHeader drop={privateDrop} />);
    expect(screen.getByText("🔒 Private")).toBeInTheDocument();
  });

  it("does not render emoji when not provided", () => {
    const dropWithoutEmoji = { ...mockDrop, emoji: null };
    const { container } = render(<DropHeader drop={dropWithoutEmoji} />);
    expect(
      container.querySelector('[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
  });
});
