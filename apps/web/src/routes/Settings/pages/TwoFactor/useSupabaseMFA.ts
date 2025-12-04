import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";

type MFATotpFactor = {
  id: string;
  friendly_name?: string | null;
  created_at?: string;
  factor_type?: string;
  totp?: {
    qr_code?: string;
    uri?: string;
    secret?: string;
  };
};

type MFAFactors = {
  totp?: MFATotpFactor[];
};

export type SupabaseMFAState = "inactive" | "enrolling" | "active";

// Types for Supabase MFA API (partial, as Supabase doesn't export full types)
type MFAEnrollParams = {
  factorType: "totp";
};

type MFAEnrollResponse = {
  id?: string;
  factor_type?: string;
  friendly_name?: string | null;
  created_at?: string;
  qr_code?: string;
  uri?: string;
  secret?: string;
  totp?: {
    id?: string;
    qr_code?: string;
    uri?: string;
    secret?: string;
    friendly_name?: string | null;
    created_at?: string;
    factor_type?: string;
  };
};

type MFAVerifyParams = {
  factorId: string;
  code: string;
  challengeId?: string;
};

type MFAChallengeParams = {
  factorId: string;
};

type MFAChallengeResponse = {
  id?: string;
};

type MFAUnenrollParams = {
  factorId: string;
};

// Type guard for Supabase MFA API
type SupabaseMFAClient = {
  listFactors: () => Promise<{ data?: MFAFactors; error?: unknown }>;
  enroll: (
    params: MFAEnrollParams,
  ) => Promise<{ data?: MFAEnrollResponse; error?: unknown }>;
  verify: (
    params: MFAVerifyParams,
  ) => Promise<{ data?: unknown; error?: unknown }>;
  challenge: (
    params: MFAChallengeParams,
  ) => Promise<{ data?: MFAChallengeResponse; error?: unknown }>;
  unenroll: (
    params: MFAUnenrollParams,
  ) => Promise<{ data?: unknown; error?: unknown }>;
};

export function useSupabaseMFA() {
  const { t } = useTranslation();
  const { loading: loadingFactors, execute } = useAsyncOperation<MFAFactors>();
  const { submitting, submit } = useAsyncSubmit<void>();

  const [state, setState] = useState<SupabaseMFAState>("inactive");
  const [factors, setFactors] = useState<MFAFactors | null>(null);
  const [enrollingFactor, setEnrollingFactor] = useState<MFATotpFactor | null>(
    null,
  );
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");

  /**
   * Supabase's MFA enroll endpoint can return:
   * - `uri`: the otpauth:// URI (best for generating QR codes)
   * - `secret`: the raw shared secret
   * - `qr_code`: a data:image/png;base64,... string that already encodes a QR image
   *
   * The `qrcode.react` component expects *text* to encode, not a base64 PNG.
   * Passing the `qr_code` image string directly will cause a "RangeError: Data too long".
   *
   * This helper makes sure we always pass a safe, text-based value to the QR
   * component by preferring `uri` or `secret` and only ever falling back to
   * `qr_code` if it's not an image data URL.
   */
  const getSafeQrCodeValue = (params?: {
    uri?: string;
    secret?: string;
    qr_code?: string;
  }) => {
    if (!params) return "";

    if (params.uri) return params.uri;
    if (params.secret) return params.secret;

    const code = params.qr_code ?? "";
    if (code && !code.startsWith("data:image/")) {
      return code;
    }

    return "";
  };

  const loadFactors = useCallback(async () => {
    // If there's no active session, Supabase MFA API will throw
    // AuthSessionMissingError. We avoid calling listFactors in that case.
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      setFactors(null);
      setState("inactive");
      return;
    }

    const result = await execute(async () => {
      // Supabase JS client returns an object with { data, error }.
      // In tests, this might be mocked differently, so we defensively
      // handle cases where the result is undefined or has no data.
      const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;
      const listResult = (await mfaClient.listFactors()) ?? {};
      const { data, error } = listResult;

      if (error) {
        console.error("[MFA] Failed to list factors:", error);
        toast.error(t("settings_2fa_load_failed"));
        return { totp: [] };
      }

      return (data as MFAFactors) ?? { totp: [] };
    });

    if (!result) return;

    setFactors(result);

    const hasTotp = result.totp && result.totp.length > 0;
    setState(hasTotp ? "active" : "inactive");
  }, [execute, t]);

  useEffect(() => {
    // Initial load on mount
    loadFactors();
  }, [loadFactors]);

  const enroll = useCallback(async () => {
    await submit(async () => {
      const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;

      // Try enrollment directly (fast path)
      const result = await mfaClient.enroll({
        factorType: "totp",
      });

      // Handle 422 errors - if Supabase returns factor data, use it to resume
      if (result.error) {
        const errorMsg =
          result.error instanceof Error
            ? result.error.message
            : String(result.error);
        const errorObj = result.error as { status?: number; message?: string };
        const errorStatus = errorObj?.status;
        const is422 =
          errorStatus === 422 ||
          errorMsg.includes("422") ||
          errorMsg.includes("already exists");

        if (is422) {
          // Check if factor data is in the response (Supabase may return it even with 422)
          const existingFactorData = result.data as
            | MFAEnrollResponse
            | undefined;

          if (
            existingFactorData &&
            (existingFactorData.uri ||
              existingFactorData.secret ||
              existingFactorData.totp)
          ) {
            // Resume with existing factor
            console.log("[MFA] Resuming with existing unverified factor");
            // Continue below with result.data
          } else {
            // No factor data - can't resume automatically
            console.error(
              "[MFA] 422 error but no factor data available:",
              result.error,
            );
            toast.error(
              t("settings_2fa_resume_failed") ||
                "A previous 2FA setup was not completed. Please refresh the page and try again.",
            );
            throw result.error;
          }
        } else {
          // Non-422 error - fail normally
          console.error("[MFA] Enrollment failed:", result.error);
          toast.error(t("settings_2fa_activation_failed"));
          throw result.error;
        }
      }

      // Handle different response structures from Supabase MFA
      // The response can be either:
      // 1. { totp: { id, qr_code, uri, secret, ... } }
      // 2. { id, qr_code, uri, secret, ... } (direct factor object)
      const response = result.data as MFAEnrollResponse;
      const totpData = response?.totp;
      const directData = response && !totpData ? response : null;
      const factorData = totpData ?? directData;

      const factor: MFATotpFactor = {
        id: factorData?.id ?? "",
        friendly_name: factorData?.friendly_name ?? null,
        created_at: factorData?.created_at,
        factor_type: factorData?.factor_type ?? "totp",
        totp: totpData
          ? {
              qr_code: totpData.qr_code,
              uri: totpData.uri,
              secret: totpData.secret,
            }
          : {
              qr_code: directData?.qr_code,
              uri: directData?.uri,
              secret: directData?.secret,
            },
      };

      setEnrollingFactor(factor);
      setState("enrolling");

      // Use a safe, text-based value for the QR code to avoid "Data too long"
      // errors from the QR code library when Supabase returns a base64 PNG.
      const qr = getSafeQrCodeValue({
        uri: factor.totp?.uri,
        secret: factor.totp?.secret,
        qr_code: factor.totp?.qr_code,
      });

      if (!qr) {
        console.warn("[MFA] No QR code data returned from enroll");
        toast.error(t("settings_2fa_qr_code_failed"));
      } else {
        setQrCodeData(qr);
      }

      toast.success(t("settings_2fa_setup_started"));
    });
  }, [submit, t]);

  const verifyEnrollment = useCallback(
    async (code: string) => {
      if (!enrollingFactor?.id) {
        toast.error(t("settings_2fa_setup_required"));
        return false;
      }

      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      await submit(async () => {
        const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;
        const { error } = await mfaClient.verify({
          factorId: enrollingFactor.id,
          code,
        });

        if (error) {
          console.error("[MFA] Failed to verify enrollment code:", error);
          toast.error(t("settings_2fa_code_incorrect"));
          throw error;
        }

        toast.success(t("settings_2fa_activated"));
        setEnrollingFactor(null);
        setQrCodeData("");
        setState("active");
        await loadFactors();
      });

      return true;
    },
    [enrollingFactor, submit, t, loadFactors],
  );

  const startChallenge = useCallback(async () => {
    // Make sure we have factors; reload if needed
    let currentFactors = factors;
    if (!currentFactors) {
      await loadFactors();
      currentFactors = factors;
    }

    const totpFactor = currentFactors?.totp?.[0];

    if (!totpFactor) {
      console.warn("[MFA] No TOTP factor found for challenge");
      toast.error(t("settings_2fa_not_active"));
      return;
    }

    await submit(async () => {
      const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;
      const { data, error } = await mfaClient.challenge({
        factorId: totpFactor.id,
      });

      if (error) {
        console.error("[MFA] Failed to start MFA challenge:", error);
        toast.error(t("settings_2fa_challenge_failed"));
        throw error;
      }

      setChallengeId((data as MFAChallengeResponse)?.id ?? null);
    });
  }, [factors, loadFactors, submit, t]);

  const verifyChallenge = useCallback(
    async (code: string) => {
      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      // We always use the first totp factor for now
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        toast.error(t("settings_2fa_not_active"));
        return false;
      }

      await submit(async () => {
        const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;
        const { error } = await mfaClient.verify({
          factorId: totpFactor.id,
          code,
          challengeId: challengeId ?? undefined,
        });

        if (error) {
          console.error("[MFA] Failed to verify MFA challenge:", error);
          toast.error(t("settings_2fa_code_incorrect"));
          throw error;
        }

        toast.success(t("settings_2fa_verified"));
        setChallengeId(null);
        // After successful challenge, Supabase should upgrade the session to aal2
      });

      return true;
    },
    [challengeId, factors, submit, t],
  );

  const unenroll = useCallback(
    async (factorId: string) => {
      await submit(async () => {
        const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;
        const { error } = await mfaClient.unenroll({
          factorId,
        });

        if (error) {
          console.error("[MFA] Failed to unenroll factor:", error);
          toast.error(t("settings_2fa_disable_failed"));
          throw error;
        }

        toast.success(t("settings_2fa_disabled"));
        await loadFactors();
      });
    },
    [submit, t, loadFactors],
  );

  return {
    state,
    loading: loadingFactors,
    submitting,
    factors,
    qrCodeData,
    enroll,
    verifyEnrollment,
    startChallenge,
    verifyChallenge,
    unenroll,
    reload: loadFactors,
  };
}
