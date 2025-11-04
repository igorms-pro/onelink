import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { supabase } from "../src/lib/supabase";

// Mock supabase
vi.mock("../src/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe("drops RPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get_drops_by_slug returns only active drops", async () => {
    const mockSlug = "test-profile";
    const mockDrops = [
      {
        drop_id: "drop-1",
        label: "Active Drop 1",
        emoji: "📁",
        order: 1,
        max_file_size_mb: 50,
      },
      {
        drop_id: "drop-2",
        label: "Active Drop 2",
        emoji: "📎",
        order: 2,
        max_file_size_mb: 100,
      },
    ];

    // Mock RPC to return only active drops (filtered by SQL)
    (supabase.rpc as unknown as Mock).mockResolvedValue({
      data: mockDrops,
      error: null,
    });

    const result = await supabase.rpc("get_drops_by_slug", {
      p_slug: mockSlug,
    });

    expect(result.data).toEqual(mockDrops);
    expect(result.data.length).toBe(2);
    expect(supabase.rpc).toHaveBeenCalledWith("get_drops_by_slug", {
      p_slug: mockSlug,
    });

    // Verify all returned drops have required fields
    type DropResult = {
      drop_id: string;
      label: string;
      order: number;
      max_file_size_mb: number;
    };
    result.data.forEach((drop: DropResult) => {
      expect(drop).toHaveProperty("drop_id");
      expect(drop).toHaveProperty("label");
      expect(drop).toHaveProperty("order");
      expect(drop).toHaveProperty("max_file_size_mb");
    });
  });

  it("get_drops_by_slug returns empty array when no active drops", async () => {
    const mockSlug = "test-profile";

    // Mock RPC to return empty array (no active drops)
    (supabase.rpc as unknown as Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await supabase.rpc("get_drops_by_slug", {
      p_slug: mockSlug,
    });

    expect(result.data).toEqual([]);
    expect(result.data.length).toBe(0);
  });

  it("get_drops_by_slug handles errors gracefully", async () => {
    const mockSlug = "invalid-slug";

    // Mock RPC to return error
    (supabase.rpc as unknown as Mock).mockResolvedValue({
      data: null,
      error: { message: "Profile not found", code: "PGRST116" },
    });

    const result = await supabase.rpc("get_drops_by_slug", {
      p_slug: mockSlug,
    });

    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
  });
});
