import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getOrCreateProfile, getSelfPlan } from "../src/lib/profile";
import { supabase } from "../src/lib/supabase";

// Mock supabase
vi.mock("../src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("profile utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getOrCreateProfile creates profile if missing", async () => {
    const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
    const mockProfile = {
      id: "profile-id",
      user_id: mockUserId,
      slug: "test-slug",
      display_name: "Test User",
      bio: null,
      avatar_url: null,
    };

    // Mock auth.getUser
    (supabase.auth.getUser as unknown as Mock).mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });

    // Mock users upsert
    const mockUsersUpsert = vi.fn().mockReturnValue({
      error: null,
    });

    // Mock: profile doesn't exist, then create
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }),
    });

    (supabase.from as unknown as Mock).mockImplementation((table: string) => {
      if (table === "users") {
        return {
          upsert: mockUsersUpsert,
        };
      }
      if (table === "profiles") {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      return {};
    });

    const result = await getOrCreateProfile(mockUserId);
    expect(result.slug).toBe("test-slug");
  });

  it("getSelfPlan returns free by default", async () => {
    const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

    const mockRpc = vi.fn().mockResolvedValue({
      data: "free",
      error: null,
    });

    (supabase.rpc as unknown as Mock).mockImplementation(mockRpc);

    const plan = await getSelfPlan(mockUserId);
    expect(plan).toBe("free");
    expect(mockRpc).toHaveBeenCalledWith("get_plan_by_user", {
      p_user_id: mockUserId,
    });
  });
});
