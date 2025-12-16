import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { MFAFactors } from "../types";
import { challengeFactor, verifyCode } from "../mfaApi";

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
    let currentFactors = factors;
    if (!currentFactors) {
      await loadFactors();
      currentFactors = factors;
    }

    const totpFactor = currentFactors?.totp?.[0];

    if (!totpFactor) {
      toast.error(t("settings_2fa_not_active"));
      return;
    }

    await submit(async () => {
      const challenge = await challengeFactor(totpFactor.id);
      onChallengeIdSet(challenge?.id ?? null);
    });
  }, [factors, loadFactors, submit, t, onChallengeIdSet]);

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
        onChallengeIdSet(null);
      });

      return true;
    },
    [challengeId, factors, submit, t, onChallengeIdSet],
  );

  return {
    startChallenge,
    verifyChallenge,
    submitting,
  };
}
