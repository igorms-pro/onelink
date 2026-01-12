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

  it("getOrCreateProfile returns null if profile missing", async () => {
    const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

    // Mock auth.getUser
    (supabase.auth.getUser as unknown as Mock).mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });

    // Mock users table: upsert (called first in getOrCreateProfile)
    const mockUsersUpsert = vi.fn().mockResolvedValue({
      error: null,
    });

    // Mock profiles table: profile doesn't exist
    const mockProfilesSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
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
          select: mockProfilesSelect,
        };
      }
      return {};
    });

    const result = await getOrCreateProfile(mockUserId);
    expect(result).toBeNull();
    // Should not call insert - profile creation is now handled separately
    expect(mockProfilesSelect).toHaveBeenCalled();
  });

  it("getOrCreateProfile returns existing profile", async () => {
    const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
    const mockProfile = {
      id: "profile-id",
      user_id: mockUserId,
      slug: "existing-slug",
      display_name: "Existing User",
      bio: "Bio text",
      avatar_url: "https://example.com/avatar.jpg",
    };

    // Mock auth.getUser
    (supabase.auth.getUser as unknown as Mock).mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });

    // Mock users table: upsert (called first in getOrCreateProfile)
    const mockUsersUpsert = vi.fn().mockResolvedValue({
      error: null,
    });

    // Mock profiles table: profile exists
    const mockProfilesSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: mockProfile, error: null }),
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
          select: mockProfilesSelect,
        };
      }
      return {};
    });

    const result = await getOrCreateProfile(mockUserId);
    expect(result.slug).toBe("existing-slug");
    expect(result.display_name).toBe("Existing User");
    // Should not call insert
    expect(mockProfilesSelect).toHaveBeenCalled();
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
