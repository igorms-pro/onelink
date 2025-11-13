import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropList } from "../DropList";
import { toast } from "sonner";
import type { DropRow } from "../../types";
import { supabase } from "@/lib/supabase";

// Mock window.confirm and prompt
globalThis.confirm = vi.fn(() => true);
globalThis.prompt = vi.fn(
  (_message?: string, defaultValue?: string) => defaultValue || "New Label",
);

describe("DropList", () => {
  const mockSetDrops = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    drops: [] as DropRow[],
    setDrops: mockSetDrops,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset supabase.from to default mock behavior
    vi.mocked(supabase.from).mockReset();
    vi.mocked(supabase.from).mockImplementation(
      () =>
        ({
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
        }) as unknown as ReturnType<typeof supabase.from>,
    );
  });

  it("renders empty state when no drops", () => {
    render(<DropList {...defaultProps} />);
    expect(
      screen.getByText("No drops yet. Create your first drop above!"),
    ).toBeInTheDocument();
  });

  it("renders list of drops", () => {
    const drops: DropRow[] = [
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
      {
        id: "drop-2",
        label: "Drop 2",
        emoji: "📁",
        order: 2,
        is_active: false,
      },
    ];
    render(<DropList {...defaultProps} drops={drops} />);
    expect(screen.getByText("Drop 1")).toBeInTheDocument();
    expect(screen.getByText("📁 Drop 2")).toBeInTheDocument();
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

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });

  it("handles toggle drop active state", async () => {
    const user = userEvent.setup();
    const drops: DropRow[] = [
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
    ];

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { is_active: false },
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
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
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
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
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

    await waitFor(() => {
      expect(globalThis.confirm).toHaveBeenCalled();
      expect(mockSetDrops).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Drop deleted");
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.confirm).mockReturnValue(false);
    const drops: DropRow[] = [
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
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

    await waitFor(() => {
      expect(mockSetDrops).not.toHaveBeenCalled();
    });
  });

  it.skip("handles delete error", async () => {
    const user = userEvent.setup();
    const drops: DropRow[] = [
      { id: "drop-1", label: "Drop 1", emoji: null, order: 1, is_active: true },
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
        } as ReturnType<typeof supabase.from>;
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
      } as ReturnType<typeof supabase.from>;
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

    await waitFor(
      () => {
        expect(globalThis.confirm).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Wait for the error toast after confirmation
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("common_delete_failed");
      },
      { timeout: 3000 },
    );
  });
});
