import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type {
  MFATotpFactor,
  MFAFactors,
  SupabaseMFAState,
  MFAEnrollResponse,
} from "./types";
import {
  getSafeQrCodeValue,
  parseEnrollmentResponse,
  is422Error,
  isFactorNotFoundError,
} from "./mfaUtils";
import {
  listFactors,
  enrollFactor,
  challengeFactor,
  verifyCode,
  unenrollFactor,
  cleanupVerifiedFactors,
} from "./mfaApi";

export type { SupabaseMFAState };

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

  const loadFactors = useCallback(async () => {
    console.log("[MFA] Loading factors...");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      setFactors(null);
      setState("inactive");
      console.log("[MFA] No active session or session error.");
      return;
    }

    const factorsResult = await execute(async () => {
      try {
        return await listFactors();
      } catch (err) {
        console.error("[MFA] Failed to list factors:", err);
        toast.error(t("settings_2fa_load_failed"));
        return { totp: [] };
      }
    });

    if (!factorsResult) {
      console.warn("[MFA] No result from execute function.");
      return;
    }

    setFactors(factorsResult);
    const hasTotp = factorsResult.totp && factorsResult.totp.length > 0;
    setState(hasTotp ? "active" : "inactive");
  }, [execute, t]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const enroll = useCallback(async () => {
    await submit(async () => {
      console.log("[MFA] ===== ENROLLMENT START =====");

      // Try enrollment directly (fast path)
      console.log("[MFA] Calling enroll()...");
      let result: { data?: MFAEnrollResponse; error?: unknown };

      try {
        const data = await enrollFactor();
        result = { data, error: undefined };
      } catch (enrollError) {
        result = enrollError as { data?: MFAEnrollResponse; error?: unknown };
      }

      console.log("[MFA] Enroll response:", {
        hasError: !!result.error,
        hasData: !!result.data,
        errorMessage:
          result.error instanceof Error
            ? result.error.message
            : String(result.error),
      });

      // Handle 422 errors - unverified factor exists
      if (result.error && is422Error(result.error)) {
        const existingFactorData = result.data;

        if (
          existingFactorData &&
          (existingFactorData.uri ||
            existingFactorData.secret ||
            existingFactorData.totp)
        ) {
          // Resume with existing factor
          console.log("[MFA] Resuming with existing unverified factor");
          result = { data: existingFactorData, error: undefined };
        } else {
          // Try to clean up verified factors and retry
          console.log(
            "[MFA] 422 error - attempting to clean up unverified factors...",
          );

          try {
            await cleanupVerifiedFactors();
          } catch (cleanupError) {
            console.warn("[MFA] Cleanup attempt failed:", cleanupError);
          }

          // Retry enrollment after cleanup
          console.log("[MFA] Retrying enrollment after cleanup attempt...");
          try {
            const retryData = await enrollFactor();
            result = { data: retryData, error: undefined };
          } catch (retryError) {
            const retryFactorData = (
              retryError as {
                data?: MFAEnrollResponse;
              }
            ).data;
            if (
              retryFactorData &&
              (retryFactorData.uri ||
                retryFactorData.secret ||
                retryFactorData.totp)
            ) {
              result = { data: retryFactorData, error: undefined };
            } else {
              console.error(
                "[MFA] Cannot resume - unverified factor exists but not accessible via API",
              );
              toast.error(
                "An unverified 2FA factor is blocking enrollment. Please delete it from Supabase dashboard (auth.mfa_factors table) or contact support.",
              );
              throw retryError;
            }
          }
        }
      } else if (result.error) {
        // Non-422 error - fail normally
        console.error("[MFA] Enrollment failed:", result.error);
        toast.error(t("settings_2fa_activation_failed"));
        throw result.error;
      }

      // Parse enrollment response
      if (!result.data) {
        throw new Error("No enrollment data received");
      }

      console.log("[MFA] Parsing enrollment response...");
      const factor = parseEnrollmentResponse(result.data);

      console.log("[MFA] Factor ID found:", factor.id);
      console.log("[MFA] Built factor object:", {
        id: factor.id,
        hasTotp: !!factor.totp,
        hasUri: !!factor.totp?.uri,
        hasSecret: !!factor.totp?.secret,
      });

      setEnrollingFactor(factor);
      setState("enrolling");

      // Extract QR code data
      const qr = getSafeQrCodeValue({
        uri: factor.totp?.uri,
        secret: factor.totp?.secret,
        qr_code: factor.totp?.qr_code,
      });

      if (!qr) {
        console.warn("[MFA] No QR code data returned from enroll");
        toast.error(t("settings_2fa_qr_code_failed"));
      } else {
        console.log("[MFA] Setting QR code data (length:", qr.length, ")");
        setQrCodeData(qr);
      }

      console.log("[MFA] ===== ENROLLMENT SUCCESS =====", {
        factorId: factor.id,
        state: "enrolling",
        hasQrCode: !!qr,
      });
      toast.success(t("settings_2fa_setup_started"));
    });
  }, [submit, t]);

  const verifyEnrollment = useCallback(
    async (code: string) => {
      console.log("[MFA] ===== VERIFICATION START =====", {
        codeLength: code.length,
        enrollingFactorId: enrollingFactor?.id,
      });

      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      await submit(async () => {
        const factorId = enrollingFactor?.id;

        if (!factorId) {
          console.error("[MFA] ❌ Factor ID not in state - state was lost");
          toast.error(
            "2FA setup state was lost. Please click 'Enable 2FA' again to start over.",
          );
          throw new Error(
            "Cannot recover factor ID - state lost. Please re-enroll.",
          );
        }

        console.log("[MFA] Calling challenge for verification...");
        let challengeId: string | undefined;

        try {
          const challenge = await challengeFactor(factorId);
          challengeId = challenge?.id;
        } catch (error) {
          console.error("[MFA] ❌ challenge not fetched:", error);
          toast.error(
            "Challenge call error. Please click 'Enable 2FA' again to start over.",
          );
          throw new Error("Cannot recover Challenge. Please re-enroll.");
        }

        if (!challengeId) {
          console.error("[MFA] ❌ Challenge ID is undefined");
          throw new Error("Challenge ID is required for verification");
        }

        console.log("[MFA] Calling verify() with:", {
          factorId,
          codeLength: code.length,
        });

        try {
          await verifyCode(factorId, code, challengeId);
        } catch (error) {
          console.error("[MFA] ❌ Verification failed:", error);

          if (isFactorNotFoundError(error)) {
            console.log(
              "[MFA] Factor not found - factor was likely deleted via SQL",
            );
            setEnrollingFactor(null);
            setQrCodeData("");
            setState("inactive");
            toast.error(
              "The 2FA factor was not found. Please click 'Enable 2FA' again to start over.",
            );
          } else {
            toast.error(t("settings_2fa_code_incorrect"));
          }
          throw error;
        }

        console.log("[MFA] ===== VERIFICATION SUCCESS =====");
        toast.success(t("settings_2fa_activated"));
        setEnrollingFactor(null);
        setQrCodeData("");
        setState("active");
        await loadFactors();
        console.log("[MFA] ===== VERIFICATION COMPLETE =====");
      });

      return true;
    },
    [enrollingFactor, submit, t, loadFactors],
  );

  const startChallenge = useCallback(async () => {
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
      const challenge = await challengeFactor(totpFactor.id);
      setChallengeId(challenge?.id ?? null);
    });
  }, [factors, loadFactors, submit, t]);

  const verifyChallenge = useCallback(
    async (code: string) => {
      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        toast.error(t("settings_2fa_not_active"));
        return false;
      }

      await submit(async () => {
        await verifyCode(totpFactor.id, code, challengeId ?? undefined);
        toast.success(t("settings_2fa_verified"));
        setChallengeId(null);
      });

      return true;
    },
    [challengeId, factors, submit, t],
  );

  const unenroll = useCallback(
    async (factorId: string) => {
      await submit(async () => {
        await unenrollFactor(factorId);
        toast.success(t("settings_2fa_disabled"));
        setEnrollingFactor(null);
        setQrCodeData("");
        setState("inactive");
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
  };
}
