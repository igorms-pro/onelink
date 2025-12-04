import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MFAChallenge } from "../MFAChallenge";

vi.mock("@/routes/Settings/pages/TwoFactor/useSupabaseMFA", () => ({
  useSupabaseMFA: vi.fn(),
}));

import { useSupabaseMFA } from "@/routes/Settings/pages/TwoFactor/useSupabaseMFA";

describe("MFAChallenge", () => {
  const startChallenge = vi.fn();
  const verifyChallenge = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location.assign so we can assert navigation
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    };

    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge,
      verifyChallenge,
      unenroll: vi.fn(),
      reload: vi.fn(),
    });
  });

  it("starts a challenge when opened", () => {
    render(
      <MemoryRouter>
        <MFAChallenge />
      </MemoryRouter>,
    );

    expect(startChallenge).toHaveBeenCalled();
  });

  it("submits code, verifies challenge and navigates on success", async () => {
    verifyChallenge.mockResolvedValueOnce(true);
    const onVerified = vi.fn();

    render(
      <MemoryRouter>
        <MFAChallenge onVerified={onVerified} />
      </MemoryRouter>,
    );

    const input = screen.getByTestId("mfa-code-input") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "123456" } });
    });

    const button = screen.getByTestId("mfa-verify-button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(verifyChallenge).toHaveBeenCalledWith("123456");
    expect(onVerified).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/dashboard");
  });
});
