import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinksList, type LinkRow } from "../LinksList";
import { toast } from "sonner";

// Note: supabase is mocked globally in vitest.setup.ts
// We'll override it in individual tests using vi.mocked()

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock window.confirm
globalThis.confirm = vi.fn(() => true);
globalThis.prompt = vi.fn(
  (_message?: string, defaultValue?: string) => defaultValue || "New Label",
);

import { supabase } from "@/lib/supabase";

describe("LinksList", () => {
  const mockSetLinks = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    links: [] as LinkRow[],
    setLinks: mockSetLinks,
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
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          insert: vi.fn(() => ({
            data: [],
            error: null,
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
          upsert: vi.fn(() => ({
            data: [],
            error: null,
          })),
        }) as unknown as ReturnType<typeof supabase.from>,
    );
  });

  it("renders empty state when no links", () => {
    render(<LinksList {...defaultProps} />);
    expect(
      screen.getByText("dashboard_content_links_empty"),
    ).toBeInTheDocument();
  });

  it("renders list of links", () => {
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
      },
      {
        id: "link-2",
        label: "Link 2",
        url: "https://test.com",
        emoji: "🔗",
        order: 2,
      },
    ];
    render(<LinksList {...defaultProps} links={links} />);
    expect(screen.getByText("Link 1")).toBeInTheDocument();
    expect(screen.getByText("🔗 Link 2")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("https://test.com")).toBeInTheDocument();
  });

  it("handles edit link", async () => {
    const user = userEvent.setup();
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Old Label",
        url: "https://example.com",
        emoji: null,
        order: 1,
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

    render(<LinksList {...defaultProps} links={links} />);
    const editButtons = screen.getAllByLabelText("common_edit");
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(mockSetLinks).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "dashboard_content_links_update_success",
      );
    });
  });

  it("handles edit error", async () => {
    const user = userEvent.setup();
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Old Label",
        url: "https://example.com",
        emoji: null,
        order: 1,
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

    render(<LinksList {...defaultProps} links={links} />);
    const editButtons = screen.getAllByLabelText("common_edit");
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("common_update_failed");
    });
  });

  it("handles delete link with confirmation", async () => {
    const user = userEvent.setup();
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
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

    render(<LinksList {...defaultProps} links={links} />);
    const deleteButtons = screen.getAllByLabelText("common_delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(globalThis.confirm).toHaveBeenCalled();
      expect(mockSetLinks).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "dashboard_content_links_delete_success",
      );
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.confirm).mockReturnValue(false);
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
      },
    ];

    render(<LinksList {...defaultProps} links={links} />);
    const deleteButtons = screen.getAllByLabelText("common_delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockSetLinks).not.toHaveBeenCalled();
    });
  });

  it.skip("handles delete error", async () => {
    const user = userEvent.setup();
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
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
      if (table === "links") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [],
              error: null,
            })),
            data: [],
            error: null,
          })),
          insert: vi.fn(() => ({
            data: [],
            error: null,
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
          delete: mockDeleteChain,
          upsert: vi.fn(() => ({
            data: [],
            error: null,
          })),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      // For other tables, return default mock
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        insert: vi.fn(() => ({
          data: [],
          error: null,
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        upsert: vi.fn(() => ({
          data: [],
          error: null,
        })),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    render(<LinksList {...defaultProps} links={links} />);
    const deleteButtons = screen.getAllByLabelText("common_delete");
    await user.click(deleteButtons[0]);

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("common_delete_failed");
      },
      { timeout: 3000 },
    );
  });

  it("handles drag and drop reordering", async () => {
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
      },
      {
        id: "link-2",
        label: "Link 2",
        url: "https://test.com",
        emoji: null,
        order: 2,
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

    render(<LinksList {...defaultProps} links={links} />);
    const linkItems = screen.getAllByRole("listitem");

    // Simulate drag and drop
    fireEvent.dragStart(linkItems[0], {
      dataTransfer: { effectAllowed: "move" },
    });
    fireEvent.dragOver(linkItems[1], { preventDefault: vi.fn() });
    fireEvent.drop(linkItems[1]);

    await waitFor(() => {
      expect(mockSetLinks).toHaveBeenCalled();
    });
  });

  it("shows saving order message during drag and drop", async () => {
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
      },
      {
        id: "link-2",
        label: "Link 2",
        url: "https://test.com",
        emoji: null,
        order: 2,
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

    render(<LinksList {...defaultProps} links={links} />);
    const linkItems = screen.getAllByRole("listitem");

    fireEvent.dragStart(linkItems[0]);
    fireEvent.dragOver(linkItems[1], { preventDefault: vi.fn() });
    fireEvent.drop(linkItems[1]);

    await waitFor(() => {
      expect(
        screen.getByText("dashboard_content_links_saving_order"),
      ).toBeInTheDocument();
    });
  });

  it("handles drag and drop error", async () => {
    const links: LinkRow[] = [
      {
        id: "link-1",
        label: "Link 1",
        url: "https://example.com",
        emoji: null,
        order: 1,
      },
      {
        id: "link-2",
        label: "Link 2",
        url: "https://test.com",
        emoji: null,
        order: 2,
      },
    ];

    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockRejectedValue(new Error("Update failed")),
      })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    render(<LinksList {...defaultProps} links={links} />);
    const linkItems = screen.getAllByRole("listitem");

    fireEvent.dragStart(linkItems[0]);
    fireEvent.dragOver(linkItems[1], { preventDefault: vi.fn() });
    fireEvent.drop(linkItems[1]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save order");
    });
  });
});
