import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { MFATotpFactor } from "../types";
import { isFactorNotFoundError } from "../mfaUtils";
import { challengeFactor, verifyCode } from "../mfaApi";

export interface UseMFAVerificationReturn {
  verifyEnrollment: (code: string) => Promise<boolean>;
  submitting: boolean;
}

export interface UseMFAVerificationParams {
  enrollingFactor: MFATotpFactor | null;
  onVerificationSuccess: () => Promise<void>;
  onStateLost: () => void;
}

/**
 * Hook spécialisé pour gérer la vérification d'enrollment MFA
 */
export function useMFAVerification({
  enrollingFactor,
  onVerificationSuccess,
  onStateLost,
}: UseMFAVerificationParams): UseMFAVerificationReturn {
  const { t } = useTranslation();
  const { submitting, submit } = useAsyncSubmit<void>();

  const verifyEnrollment = useCallback(
    async (code: string) => {
      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      await submit(async () => {
        const factorId = enrollingFactor?.id;

        if (!factorId) {
          toast.error(
            "2FA setup state was lost. Please click 'Enable 2FA' again to start over.",
          );
          onStateLost();
          throw new Error(
            "Cannot recover factor ID - state lost. Please re-enroll.",
          );
        }

        let challengeId: string | undefined;

        try {
          const challenge = await challengeFactor(factorId);
          challengeId = challenge?.id;
        } catch {
          toast.error(
            "Challenge call error. Please click 'Enable 2FA' again to start over.",
          );
          throw new Error("Cannot recover Challenge. Please re-enroll.");
        }

        if (!challengeId) {
          throw new Error("Challenge ID is required for verification");
        }

        try {
          await verifyCode(factorId, code, challengeId);
        } catch (error) {
          if (isFactorNotFoundError(error)) {
            onStateLost();
            toast.error(
              "The 2FA factor was not found. Please click 'Enable 2FA' again to start over.",
            );
          } else {
            toast.error(t("settings_2fa_code_incorrect"));
          }
          throw error;
        }

        toast.success(t("settings_2fa_activated"));
        await onVerificationSuccess();
      });

      return true;
    },
    [enrollingFactor, submit, t, onVerificationSuccess, onStateLost],
  );

  return {
    verifyEnrollment,
    submitting,
  };
}
