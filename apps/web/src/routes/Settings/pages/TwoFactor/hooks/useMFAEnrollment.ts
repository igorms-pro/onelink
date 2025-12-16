import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { MFATotpFactor, MFAEnrollResponse } from "../types";
import {
  getSafeQrCodeValue,
  parseEnrollmentResponse,
  is422Error,
} from "../mfaUtils";
import { enrollFactor, cleanupVerifiedFactors } from "../mfaApi";

export interface UseMFAEnrollmentReturn {
  enroll: () => Promise<void>;
  submitting: boolean;
}

export interface UseMFAEnrollmentParams {
  onEnrollmentSuccess: (factor: MFATotpFactor, qrCodeData: string) => void;
}

/**
 * Hook spécialisé pour gérer l'enrollment MFA
 */
export function useMFAEnrollment({
  onEnrollmentSuccess,
}: UseMFAEnrollmentParams): UseMFAEnrollmentReturn {
  const { t } = useTranslation();
  const { submitting, submit } = useAsyncSubmit<void>();

  const enroll = useCallback(async () => {
    await submit(async () => {
      // Try enrollment directly (fast path)
      let result: { data?: MFAEnrollResponse; error?: unknown };

      try {
        const data = await enrollFactor();
        result = { data, error: undefined };
      } catch (enrollError) {
        result = enrollError as { data?: MFAEnrollResponse; error?: unknown };
      }

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
          result = { data: existingFactorData, error: undefined };
        } else {
          // Try to clean up verified factors and retry
          try {
            await cleanupVerifiedFactors();
          } catch {
            // Cleanup failed, continue with retry
          }

          // Retry enrollment after cleanup
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
              toast.error(
                "An unverified 2FA factor is blocking enrollment. Please delete it from Supabase dashboard (auth.mfa_factors table) or contact support.",
              );
              throw retryError;
            }
          }
        }
      } else if (result.error) {
        // Non-422 error - fail normally
        toast.error(t("settings_2fa_activation_failed"));
        throw result.error;
      }

      // Parse enrollment response
      if (!result.data) {
        throw new Error("No enrollment data received");
      }

      const factor = parseEnrollmentResponse(result.data);

      // Extract QR code data
      const qr = getSafeQrCodeValue({
        uri: factor.totp?.uri,
        secret: factor.totp?.secret,
        qr_code: factor.totp?.qr_code,
      });

      if (!qr) {
        toast.error(t("settings_2fa_qr_code_failed"));
        throw new Error("No QR code data returned from enroll");
      }

      toast.success(t("settings_2fa_setup_started"));
      onEnrollmentSuccess(factor, qr);
    });
  }, [submit, t, onEnrollmentSuccess]);

  return {
    enroll,
    submitting,
  };
}
