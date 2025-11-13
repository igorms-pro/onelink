import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropsSection } from "../DropsSection";
import type { PublicDrop } from "../../types";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock DropSubmissionForm
vi.mock("../DropSubmissionForm", () => ({
  DropSubmissionForm: ({ drop }: { drop: PublicDrop }) => (
    <div data-testid={`drop-form-${drop.drop_id}`}>{drop.label}</div>
  ),
}));

describe("DropsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDrops: PublicDrop[] = [
    {
      drop_id: "drop-1",
      label: "Upload Files",
      emoji: "📁",
      order: 1,
      max_file_size_mb: 10,
    },
    {
      drop_id: "drop-2",
      label: "Submit Resume",
      emoji: "📄",
      order: 2,
      max_file_size_mb: 5,
    },
  ];

  it("renders section with drops", () => {
    render(<DropsSection drops={mockDrops} />);

    expect(screen.getByText("profile_section_drops")).toBeInTheDocument();
    expect(screen.getByTestId("drop-form-drop-1")).toBeInTheDocument();
    expect(screen.getByTestId("drop-form-drop-2")).toBeInTheDocument();
  });

  it("does not render when drops array is empty", () => {
    const { container } = render(<DropsSection drops={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("expands and collapses section", () => {
    render(<DropsSection drops={mockDrops} />);

    const toggleButton = screen.getByRole("button");
    const section = screen
      .getByText("profile_section_drops")
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
    render(<DropsSection drops={mockDrops} />);

    // Initially expanded - should show ChevronUp
    expect(screen.getByTestId("drops-section-chevron-up")).toBeInTheDocument();
    expect(
      screen.queryByTestId("drops-section-chevron-down"),
    ).not.toBeInTheDocument();

    // Collapse - should show ChevronDown
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);
    expect(
      screen.getByTestId("drops-section-chevron-down"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("drops-section-chevron-up"),
    ).not.toBeInTheDocument();
  });

  it("renders DropSubmissionForm for each drop", () => {
    render(<DropsSection drops={mockDrops} />);

    expect(screen.getByText("Upload Files")).toBeInTheDocument();
    expect(screen.getByText("Submit Resume")).toBeInTheDocument();
  });

  it("renders drops in correct order", () => {
    const reversedDrops = [...mockDrops].reverse();

    render(<DropsSection drops={reversedDrops} />);

    const forms = screen.getAllByTestId(/^drop-form-/);
    expect(forms[0]).toHaveTextContent("Submit Resume");
    expect(forms[1]).toHaveTextContent("Upload Files");
  });
});
