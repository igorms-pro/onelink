import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropsSection } from "../DropsSection";
import type { DropRow } from "../../types";

// Mock DropForm and DropList
vi.mock("../DropForm", () => ({
  DropForm: ({ onDropCreated, isFree, freeDropsLimit, dropsCount }: any) => (
    <div data-testid="drop-form">
      <button
        onClick={() =>
          onDropCreated({
            id: "new-drop",
            label: "New Drop",
            emoji: null,
            order: 1,
            is_active: true,
          })
        }
      >
        Create Drop
      </button>
      {isFree && dropsCount >= freeDropsLimit && (
        <div>Free plan limit reached</div>
      )}
    </div>
  ),
}));

vi.mock("../DropList", () => ({
  DropList: ({ drops }: any) => (
    <div data-testid="drop-list">
      {drops.map((d: any) => (
        <div key={d.id}>{d.label}</div>
      ))}
    </div>
  ),
}));

describe("DropsSection", () => {
  const mockSetDrops = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    drops: [] as DropRow[],
    setDrops: mockSetDrops,
    isFree: false,
    freeDropsLimit: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title and description", () => {
    render(<DropsSection {...defaultProps} />);
    expect(screen.getByText("Drops")).toBeInTheDocument();
    expect(
      screen.getByText(/Create file inboxes for people to submit files/),
    ).toBeInTheDocument();
  });

  it("expands and collapses section", async () => {
    const user = userEvent.setup();
    render(<DropsSection {...defaultProps} />);
    const toggleButton = screen.getByLabelText("Collapse");
    expect(screen.getByTestId("drop-form")).toBeInTheDocument();
    await user.click(toggleButton);
    expect(screen.queryByTestId("drop-form")).not.toBeInTheDocument();
  });

  it("renders DropForm and DropList when expanded", () => {
    const drops: DropRow[] = [
      {
        id: "drop-1",
        label: "Drop 1",
        emoji: null,
        order: 1,
        is_active: true,
        is_public: true,
        share_token: "token-123",
      },
    ];
    render(<DropsSection {...defaultProps} drops={drops} />);
    expect(screen.getByTestId("drop-form")).toBeInTheDocument();
    expect(screen.getByTestId("drop-list")).toBeInTheDocument();
    expect(screen.getByText("Drop 1")).toBeInTheDocument();
  });

  it("handles drop creation and updates order", async () => {
    const user = userEvent.setup();
    const existingDrops: DropRow[] = [
      {
        id: "drop-1",
        label: "Drop 1",
        emoji: null,
        order: 1,
        is_active: true,
        is_public: true,
        share_token: "token-123",
      },
    ];
    render(<DropsSection {...defaultProps} drops={existingDrops} />);
    const createButton = screen.getByText("Create Drop");
    await user.click(createButton);

    expect(mockSetDrops).toHaveBeenCalled();
    const callArgs = mockSetDrops.mock.calls[0][0];
    expect(Array.isArray(callArgs)).toBe(true);
    expect(callArgs.length).toBe(2);
  });

  it("shows limit reached message for free plan", () => {
    render(
      <DropsSection
        {...defaultProps}
        isFree={true}
        freeDropsLimit={2}
        drops={[
          {
            id: "drop-1",
            label: "D1",
            emoji: null,
            order: 1,
            is_active: true,
            is_public: true,
            share_token: "token-123",
          },
          {
            id: "drop-2",
            label: "D2",
            emoji: null,
            order: 2,
            is_active: true,
            is_public: true,
            share_token: "token-456",
          },
        ]}
      />,
    );
    expect(screen.getByText(/Free plan limit reached/)).toBeInTheDocument();
  });
});
