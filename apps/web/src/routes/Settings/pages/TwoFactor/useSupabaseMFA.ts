import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { MFATotpFactor, MFAFactors, SupabaseMFAState } from "./types";
import { listFactors, unenrollFactor } from "./mfaApi";
import { useMFAEnrollment } from "./hooks/useMFAEnrollment";
import { useMFAVerification } from "./hooks/useMFAVerification";
import { useMFAChallenge } from "./hooks/useMFAChallenge";

export type { SupabaseMFAState };

export function useSupabaseMFA() {
  const { t } = useTranslation();
  const { submitting: submittingUnenroll, submit } = useAsyncSubmit<void>();

  const [state, setState] = useState<SupabaseMFAState>("inactive");
  const [factors, setFactors] = useState<MFAFactors | null>(null);
  const [enrollingFactor, setEnrollingFactor] = useState<MFATotpFactor | null>(
    null,
  );
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadFactors = useCallback(async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      setFactors(null);
      setState("inactive");
      setLoading(false);
      return;
    }

    try {
      const factorsResult = await listFactors();
      setFactors(factorsResult);
      const hasTotp = factorsResult.totp && factorsResult.totp.length > 0;
      setState(hasTotp ? "active" : "inactive");
    } catch (err) {
      console.error("[MFA] Failed to list factors:", err);
      toast.error(t("settings_2fa_load_failed"));
      setFactors({ totp: [] });
      setState("inactive");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  // Handle enrollment success
  const handleEnrollmentSuccess = useCallback(
    (factor: MFATotpFactor, qr: string) => {
      setEnrollingFactor(factor);
      setQrCodeData(qr);
      setState("enrolling");
    },
    [],
  );

  // Use specialized enrollment hook
  const { enroll, submitting: submittingEnrollment } = useMFAEnrollment({
    onEnrollmentSuccess: handleEnrollmentSuccess,
  });

  // Handle verification success
  const handleVerificationSuccess = useCallback(async () => {
    setEnrollingFactor(null);
    setQrCodeData("");
    setState("active");
    await loadFactors();
  }, [loadFactors]);

  // Handle state lost
  const handleStateLost = useCallback(() => {
    setEnrollingFactor(null);
    setQrCodeData("");
    setState("inactive");
  }, []);

  // Use specialized verification hook
  const { verifyEnrollment, submitting: submittingVerification } =
    useMFAVerification({
      enrollingFactor,
      onVerificationSuccess: handleVerificationSuccess,
      onStateLost: handleStateLost,
    });

  // Use specialized challenge hook
  const {
    startChallenge,
    verifyChallenge,
    submitting: submittingChallenge,
  } = useMFAChallenge({
    factors,
    challengeId,
    loadFactors,
    onChallengeIdSet: setChallengeId,
  });

  // Unenroll function (no specialized hook needed)
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

  // Combine submitting states from all hooks
  const submitting =
    submittingEnrollment ||
    submittingVerification ||
    submittingChallenge ||
    submittingUnenroll;

  return {
    state,
    loading,
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
