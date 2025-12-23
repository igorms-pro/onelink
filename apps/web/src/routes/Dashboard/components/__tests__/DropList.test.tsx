import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropList } from "../DropList";
import { toast } from "sonner";
import type { DropRow } from "../../types";

// Mock supabase
const mockFrom = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}));

// Mock PostHog
vi.mock("@/lib/posthog-events", () => ({
  trackDropUpdated: vi.fn(),
  trackDropDeleted: vi.fn(),
}));

// Mock AuthProvider
vi.mock("@/lib/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    loading: false,
  }),
}));

import { supabase } from "@/lib/supabase";

// Mock EditDropModal
vi.mock("../ContentTab/EditDropModal", () => ({
  EditDropModal: ({
    open,
    onOpenChange,
    onSave,
    drop,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (label: string) => Promise<void>;
    drop: any;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="edit-drop-modal">
        <input data-testid="edit-drop-input" defaultValue={drop.label} />
        <button
          data-testid="edit-drop-save"
          onClick={async () => {
            try {
              const input = document.querySelector(
                '[data-testid="edit-drop-input"]',
              ) as HTMLInputElement;
              await onSave(input?.value || "New Label");
              onOpenChange(false);
            } catch {
              // Error is handled by onSave, don't close modal on error
            }
          }}
        >
          Save
        </button>
        <button
          data-testid="edit-drop-cancel"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
      </div>
    );
  },
}));

// Mock DeleteDropModal
vi.mock("../ContentTab/DeleteDropModal", () => ({
  DeleteDropModal: ({
    open,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    drop: any;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="delete-drop-modal">
        <button
          data-testid="delete-drop-confirm"
          onClick={async () => {
            try {
              await onConfirm();
              onOpenChange(false);
            } catch {
              // Error is handled by onConfirm, don't close modal on error
            }
          }}
        >
          Delete
        </button>
        <button
          data-testid="delete-drop-cancel"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
      </div>
    );
  },
}));

describe("DropList", () => {
  const mockSetDrops = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    drops: [] as DropRow[],
    setDrops: mockSetDrops,
  };

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset supabase.from to default mock behavior
    mockFrom.mockClear();
    mockFrom.mockImplementation((table: string) => {
      // Handle submissions table for file count
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({ count: 0, data: null, error: null }),
            ),
          })),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      // Default for drops table
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        upsert: vi.fn(() => ({
          data: [],
          error: null,
        })),
      } as unknown as ReturnType<typeof supabase.from>;
    });
  });

  it("renders empty state when no drops", () => {
    render(<DropList {...defaultProps} />);
    expect(
      screen.getByText("No drops yet. Create your first drop above!"),
    ).toBeInTheDocument();
  });

  it("renders list of drops", async () => {
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
      {
        id: "drop-2",
        label: "Drop 2",
        emoji: "📁",
        order: 2,
        is_active: false,
        is_public: true,
        share_token: "token-123",
      },
    ];
    render(<DropList {...defaultProps} drops={drops} />);
    await waitFor(() => {
      expect(screen.getByText("Drop 1")).toBeInTheDocument();
      expect(screen.getByText("📁 Drop 2")).toBeInTheDocument();
    });
  });

  it("handles edit drop", async () => {
    const user = userEvent.setup();
    const drops: DropRow[] = [
      {
        id: "drop-1",
        label: "Old Label",
        emoji: null,
        order: 1,
        is_active: true,
        is_public: true,
        share_token: "token-123",
      },
    ];

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    const { container } = render(<DropList {...defaultProps} drops={drops} />);
    // Edit buttons are available on both mobile (sm:hidden) and desktop (hidden sm:flex)
    // Find all buttons and filter by aria-label
    const allButtons = Array.from(container.querySelectorAll("button"));
    const editButtons = allButtons.filter(
      (btn) => btn.getAttribute("aria-label") === "Edit",
    );
    expect(editButtons.length).toBeGreaterThan(0);
    // Click the first visible edit button (or any if all are hidden)
    const editButton =
      editButtons.find((btn) => !btn.hasAttribute("hidden")) || editButtons[0];
    await user.click(editButton as HTMLElement);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByTestId("edit-drop-modal")).toBeInTheDocument();
    });

    // Update the label in the modal
    const input = screen.getByTestId("edit-drop-input");
    await user.clear(input);
    await user.type(input, "New Label");

    // Click save
    const saveButton = screen.getByTestId("edit-drop-save");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSetDrops).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Drop updated");
    });
  });

  it("handles edit error", async () => {
    const user = userEvent.setup();
    const drops: DropRow[] = [
      {
        id: "drop-1",
        label: "Old Label",
        emoji: null,
        order: 1,
        is_active: true,
        is_public: true,
        share_token: "token-123",
      },
    ];

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "Error" } }),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    const { container } = render(<DropList {...defaultProps} drops={drops} />);
    // Edit buttons are available on both mobile (sm:hidden) and desktop (hidden sm:flex)
    // Find all buttons and filter by aria-label
    const allButtons = Array.from(container.querySelectorAll("button"));
    const editButtons = allButtons.filter(
      (btn) => btn.getAttribute("aria-label") === "Edit",
    );
    expect(editButtons.length).toBeGreaterThan(0);
    // Click the first visible edit button (or any if all are hidden)
    const editButton =
      editButtons.find((btn) => !btn.hasAttribute("hidden")) || editButtons[0];
    await user.click(editButton as HTMLElement);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByTestId("edit-drop-modal")).toBeInTheDocument();
    });

    // Update the label in the modal
    const input = screen.getByTestId("edit-drop-input");
    await user.clear(input);
    await user.type(input, "New Label");

    // Click save - this will trigger an error
    const saveButton = screen.getByTestId("edit-drop-save");
    await user.click(saveButton);

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Update failed");
      },
      { timeout: 3000 },
    );
  });

  it("handles toggle drop active state", async () => {
    const user = userEvent.setup();
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

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                is_active: false,
                is_public: true,
                share_token: "token-123",
              },
              error: null,
            }),
          })),
        })),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    render(<DropList {...defaultProps} drops={drops} />);
    const switches = screen.getAllByRole("switch");
    await user.click(switches[0]);

    await waitFor(() => {
      expect(mockSetDrops).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Drop deactivated");
    });
  });

  it("handles toggle error", async () => {
    const user = userEvent.setup();
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

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Error" },
            }),
          })),
        })),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    render(<DropList {...defaultProps} drops={drops} />);
    const switches = screen.getAllByRole("switch");
    await user.click(switches[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Toggle failed");
    });
  });

  it("handles delete drop with confirmation", async () => {
    const user = userEvent.setup();
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

    const mockDelete = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      delete: mockDelete,
    } as unknown as ReturnType<typeof supabase.from>);

    const { container } = render(<DropList {...defaultProps} drops={drops} />);
    // Delete buttons are available on both mobile (sm:hidden) and desktop (hidden sm:flex)
    const allButtons = Array.from(container.querySelectorAll("button"));
    const deleteButtons = allButtons.filter(
      (btn) => btn.getAttribute("aria-label") === "Delete",
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
    // Click the first visible delete button (or any if all are hidden)
    const deleteButton =
      deleteButtons.find((btn) => !btn.hasAttribute("hidden")) ||
      deleteButtons[0];
    await user.click(deleteButton as HTMLElement);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByTestId("delete-drop-modal")).toBeInTheDocument();
    });

    // Click confirm in modal
    const confirmButton = screen.getByTestId("delete-drop-confirm");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSetDrops).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Drop deleted");
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
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

    const { container } = render(<DropList {...defaultProps} drops={drops} />);
    // Delete buttons are available on both mobile (sm:hidden) and desktop (hidden sm:flex)
    const allButtons = Array.from(container.querySelectorAll("button"));
    const deleteButtons = allButtons.filter(
      (btn) => btn.getAttribute("aria-label") === "Delete",
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
    // Click the first visible delete button (or any if all are hidden)
    const deleteButton =
      deleteButtons.find((btn) => !btn.hasAttribute("hidden")) ||
      deleteButtons[0];
    await user.click(deleteButton as HTMLElement);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByTestId("delete-drop-modal")).toBeInTheDocument();
    });

    // Click cancel in modal
    const cancelButton = screen.getByTestId("delete-drop-cancel");
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockSetDrops).not.toHaveBeenCalled();
    });
  });

  it.skip("handles delete error", async () => {
    const user = userEvent.setup();
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

    // Create a mock delete chain that returns an error
    // The chain is: delete().eq("id").eq("profile_id") -> returns promise with error
    const mockDeleteChain = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
      })),
    }));

    // Override the mock for this specific test - reset first to clear beforeEach mock
    vi.mocked(supabase.from).mockReset();
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          delete: mockDeleteChain,
          upsert: vi.fn(() => ({
            data: [],
            error: null,
          })),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      // For other tables, use the default mock
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          })),
          data: [],
          error: null,
        })),
        upsert: vi.fn(() => ({
          data: [],
          error: null,
        })),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    const { container } = render(<DropList {...defaultProps} drops={drops} />);
    // Delete buttons are available on both mobile (sm:hidden) and desktop (hidden sm:flex)
    const allButtons = Array.from(container.querySelectorAll("button"));
    const deleteButtons = allButtons.filter((btn) => {
      const ariaLabel = btn.getAttribute("aria-label");
      return ariaLabel === "Delete";
    });
    expect(deleteButtons.length).toBeGreaterThan(0);
    // Click the first visible delete button (or any if all are hidden)
    const deleteButton =
      deleteButtons.find((btn) => !btn.hasAttribute("hidden")) ||
      deleteButtons[0];
    expect(deleteButton).toBeDefined();
    await user.click(deleteButton as HTMLElement);

    // Wait for modal to open
    await waitFor(
      () => {
        expect(screen.getByTestId("delete-drop-modal")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Click confirm in modal
    const confirmButton = screen.getByTestId("delete-drop-confirm");
    await user.click(confirmButton);

    // Wait for the error toast after confirmation
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete drop.");
      },
      { timeout: 3000 },
    );
  });
});
