import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { MFAFactors } from "../types";
import { challengeFactor, verifyCode, listFactors } from "../mfaApi";

export interface UseMFAChallengeReturn {
  startChallenge: () => Promise<void>;
  verifyChallenge: (code: string) => Promise<boolean>;
  submitting: boolean;
}

export interface UseMFAChallengeParams {
  factors: MFAFactors | null;
  challengeId: string | null;
  loadFactors: () => Promise<void>;
  onChallengeIdSet: (challengeId: string | null) => void;
}

/**
 * Hook spécialisé pour gérer les challenges MFA (vérification après login)
 */
export function useMFAChallenge({
  factors,
  challengeId,
  loadFactors,
  onChallengeIdSet,
}: UseMFAChallengeParams): UseMFAChallengeReturn {
  const { t } = useTranslation();
  const { submitting, submit } = useAsyncSubmit<void>();

  const startChallenge = useCallback(async () => {
    // Get factors - use cached ones if available, otherwise fetch directly
    let currentFactors: MFAFactors | null = factors;

    if (!currentFactors) {
      // If factors aren't in state, fetch them directly
      // This avoids race conditions with state updates
      try {
        currentFactors = await listFactors();
        // Also trigger loadFactors to update state for other components
        await loadFactors();
      } catch (err) {
        console.error("[MFA] Failed to load factors:", err);
        // Don't show error toast - this might be called during login flow
        // when user doesn't have MFA enabled. Just return silently.
        return;
      }
    }

    const totpFactor = currentFactors?.totp?.[0];

    if (!totpFactor) {
      // Don't show error toast - this might be called during login flow
      // when user doesn't have MFA enabled. Just return silently.
      // The AuthProvider should not have shown MFAChallenge if user has no factors.
      console.warn(
        "[MFA] No TOTP factor found - user may not have MFA enabled",
      );
      return;
    }

    await submit(async () => {
      const challenge = await challengeFactor(totpFactor.id);
      onChallengeIdSet(challenge?.id ?? null);
    });
  }, [factors, loadFactors, submit, onChallengeIdSet]);

  const verifyChallenge = useCallback(
    async (code: string) => {
      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      // Get factors - use cached ones if available, otherwise fetch directly
      let currentFactors: MFAFactors | null = factors;

      if (!currentFactors) {
        try {
          currentFactors = await listFactors();
          await loadFactors();
        } catch (err) {
          console.error("[MFA] Failed to load factors:", err);
          toast.error(t("settings_2fa_not_active"));
          return false;
        }
      }

      const totpFactor = currentFactors?.totp?.[0];

      if (!totpFactor) {
        toast.error(t("settings_2fa_not_active"));
        return false;
      }

      await submit(async () => {
        await verifyCode(totpFactor.id, code, challengeId ?? undefined);
        toast.success(t("settings_2fa_verified"));
        onChallengeIdSet(null);
      });

      return true;
    },
    [challengeId, factors, loadFactors, submit, t, onChallengeIdSet],
  );

  return {
    startChallenge,
    verifyChallenge,
    submitting,
  };
}
