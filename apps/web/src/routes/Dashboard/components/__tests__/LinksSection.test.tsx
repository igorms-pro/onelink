import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinksSection } from "../LinksSection";
import { toast } from "sonner";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow } from "../../types";
import { supabase } from "@/lib/supabase";

// Mock NewLinkForm and LinksList
vi.mock("@/components/NewLinkForm", () => ({
  NewLinkForm: ({ onCreate, disabled, limitReached }: any) => {
    return (
      <div data-testid="new-link-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({
              label: "Test Link",
              url: "https://example.com",
              emoji: null,
            });
          }}
        >
          <input name="url" defaultValue="https://example.com" />
          <button
            type="submit"
            disabled={disabled || limitReached}
            data-testid="create-link-button"
          >
            Create
          </button>
        </form>
        {limitReached && (
          <button
            onClick={() =>
              onCreate({
                label: "Test Link",
                url: "https://example.com",
                emoji: null,
              })
            }
            data-testid="create-link-limit-reached"
          >
            Create (limit reached)
          </button>
        )}
        <button
          onClick={() =>
            onCreate({ label: "Test", url: "invalid-url", emoji: null })
          }
          data-testid="create-link-invalid"
        >
          Create Invalid
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/LinksList", () => ({
  LinksList: ({ links }: any) => (
    <div data-testid="links-list">
      {links.map((l: any) => (
        <div key={l.id}>{l.label}</div>
      ))}
    </div>
  ),
}));

describe("LinksSection", () => {
  const mockSetLinks = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    links: [] as LinkRow[],
    setLinks: mockSetLinks,
    drops: [] as DropRow[],
    isFree: false,
    freeLimit: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title and description", () => {
    render(<LinksSection {...defaultProps} />);
    expect(screen.getByText("Routes")).toBeInTheDocument();
    expect(
      screen.getByText(/Create buttons that link to your content/),
    ).toBeInTheDocument();
  });

  it("expands and collapses section", async () => {
    const user = userEvent.setup();
    render(<LinksSection {...defaultProps} />);
    const toggleButton = screen.getByLabelText("common_collapse");
    expect(screen.getByTestId("new-link-form")).toBeInTheDocument();
    await user.click(toggleButton);
    expect(screen.queryByTestId("new-link-form")).not.toBeInTheDocument();
  });

  it("creates link successfully", async () => {
    const user = userEvent.setup();
    const mockLink: LinkRow = {
      id: "link-1",
      label: "Test Link",
      url: "https://example.com",
      emoji: null,
      order: 1,
    };

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockLink, error: null });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));

    vi.mocked(supabase.from).mockImplementation(
      () =>
        ({
          insert: mockInsert,
        }) as any,
    );

    render(<LinksSection {...defaultProps} />);
    const createButton = screen.getByTestId("create-link-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(mockSetLinks).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Link created successfully");
    });
  });

  it("shows error for invalid URL", async () => {
    const user = userEvent.setup();
    render(<LinksSection {...defaultProps} />);

    const createButton = screen.getByTestId("create-link-invalid");
    await user.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please enter a valid http(s) URL.",
      );
    });
  });

  it("shows error when free limit is reached", async () => {
    const user = userEvent.setup();
    render(
      <LinksSection
        {...defaultProps}
        isFree={true}
        links={[
          { id: "1", label: "L1", url: "https://1.com", emoji: null, order: 1 },
          { id: "2", label: "L2", url: "https://2.com", emoji: null, order: 2 },
        ]}
        drops={[
          { id: "1", label: "D1", emoji: null, order: 1, is_active: true },
        ]}
        freeLimit={3}
      />,
    );
    // Limit reached: 2 links + 1 drop = 3 (at limit)
    const createButton = screen.getByTestId("create-link-limit-reached");
    await user.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("handles creation error", async () => {
    const user = userEvent.setup();
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Error" } });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));

    vi.mocked(supabase.from).mockImplementation(
      () =>
        ({
          insert: mockInsert,
        }) as any,
    );

    render(<LinksSection {...defaultProps} />);
    const createButton = screen.getByTestId("create-link-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create link");
    });
  });

  it("disables form when profileId is null", () => {
    render(<LinksSection {...defaultProps} profileId={null} />);
    const button = screen.getByTestId("create-link-button");
    expect(button).toBeDisabled();
  });
});
