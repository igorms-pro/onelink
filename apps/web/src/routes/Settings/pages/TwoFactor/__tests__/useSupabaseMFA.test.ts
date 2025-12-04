import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSupabaseMFA } from "../useSupabaseMFA";

// Mock Supabase client (MFA + getSession)
vi.mock("@/lib/supabase", () => {
  const mfa = {
    listFactors: vi.fn(),
    enroll: vi.fn(),
    verify: vi.fn(),
    challenge: vi.fn(),
    unenroll: vi.fn(),
  };

  const getSession = vi.fn().mockResolvedValue({
    data: {
      session: {
        user: { id: "user-1", email: "test@example.com" },
      },
    },
    error: null,
  });

  return {
    supabase: {
      auth: {
        mfa,
        getSession,
      },
    },
  };
});

vi.mock("@/hooks/useAsyncOperation", () => ({
  useAsyncOperation: () => ({
    loading: false,
    execute: (fn: () => any) => fn(),
  }),
}));

vi.mock("@/hooks/useAsyncSubmit", () => ({
  useAsyncSubmit: () => ({
    submitting: false,
    submit: (fn: () => any) => fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Use real i18n instance (no mock of react-i18next) – useSupabaseMFA only calls t()

import { supabase } from "@/lib/supabase";

describe("useSupabaseMFA hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip("loads factors on mount and sets state to inactive when no factors", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: { totp: [] },
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {});

    expect(result.current.state).toBe("inactive");
    expect(result.current.factors).toEqual({ totp: [] });
  });

  it.skip("sets state to active when TOTP factors exist", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: {
        totp: [{ id: "factor-1", factor_type: "totp" }],
      },
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {});

    expect(result.current.state).toBe("active");
    expect(result.current.factors?.totp?.[0]?.id).toBe("factor-1");
  });

  it.skip("enrolls a new TOTP factor and exposes QR code data", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: { totp: [] },
      error: null,
    });

    (supabase.auth.mfa as any).enroll.mockResolvedValueOnce({
      data: {
        id: "factor-1",
        factor_type: "totp",
        qr_code: "otpauth://totp/OneLink:test?secret=TESTSECRET",
      },
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {
      await result.current.enroll();
    });

    expect((supabase.auth.mfa as any).enroll).toHaveBeenCalled();
    expect(result.current.state).toBe("enrolling");
    expect(result.current.qrCodeData).toContain("TESTSECRET");
  });

  it("does not verify enrollment with invalid code length", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: { totp: [] },
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    const success = await result.current.verifyEnrollment("123");
    expect(success).toBe(false);
    expect((supabase.auth.mfa as any).verify).not.toHaveBeenCalled();
  });

  it.skip("verifies enrollment with valid code", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: { totp: [] },
      error: null,
    });

    (supabase.auth.mfa as any).enroll.mockResolvedValueOnce({
      data: {
        id: "factor-1",
        factor_type: "totp",
        qr_code: "otpauth://totp/OneLink:test?secret=TESTSECRET",
      },
      error: null,
    });

    (supabase.auth.mfa as any).verify.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {
      await result.current.enroll();
    });

    const success = await result.current.verifyEnrollment("123456");

    expect(success).toBe(true);
    expect((supabase.auth.mfa as any).verify).toHaveBeenCalled();
    expect(result.current.state).toBe("active");
  });

  it.skip("starts a challenge using first TOTP factor", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: {
        totp: [{ id: "factor-1", factor_type: "totp" }],
      },
      error: null,
    });

    (supabase.auth.mfa as any).challenge.mockResolvedValueOnce({
      data: { id: "challenge-1" },
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {
      await result.current.startChallenge();
    });

    expect((supabase.auth.mfa as any).challenge).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
  });

  it.skip("verifies a challenge with a valid code", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: {
        totp: [{ id: "factor-1", factor_type: "totp" }],
      },
      error: null,
    });

    (supabase.auth.mfa as any).verify.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    const success = await result.current.verifyChallenge("123456");

    expect(success).toBe(true);
    expect((supabase.auth.mfa as any).verify).toHaveBeenCalled();
  });

  it.skip("unenrolls a factor and reloads factors", async () => {
    (supabase.auth.mfa as any).listFactors.mockResolvedValueOnce({
      data: {
        totp: [{ id: "factor-1", factor_type: "totp" }],
      },
      error: null,
    });

    (supabase.auth.mfa as any).unenroll.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useSupabaseMFA());

    await act(async () => {
      await result.current.unenroll("factor-1");
    });

    expect((supabase.auth.mfa as any).unenroll).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
  });
});
