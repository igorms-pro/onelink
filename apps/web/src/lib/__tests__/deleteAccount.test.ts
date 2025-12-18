import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccount } from "../deleteAccount";
import { supabase } from "../supabase";

vi.mock("../supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success=true when edge function succeeds", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { success: true, message: "ok" },
      error: null,
    } as any);

    const result = await deleteAccount({ mfaCode: "123456" });

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "delete-account",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({ mfa_code: "123456" }),
      }),
    );
    expect(result).toEqual({ success: true });
  });

  it("returns error when edge function returns an error object", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: "Server error" },
    } as any);

    const result = await deleteAccount({ mfaCode: "123456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Server error");
  });

  it("returns error when edge function returns a failure payload", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        success: false,
        message: "DELETE_ACCOUNT_DISABLED",
      },
      error: null,
    } as any);

    const result = await deleteAccount({ mfaCode: "123456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("DELETE_ACCOUNT_DISABLED");
  });

  it("handles unexpected exceptions gracefully", async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValue(
      new Error("Network error"),
    );

    const result = await deleteAccount({ mfaCode: "123456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });
});
