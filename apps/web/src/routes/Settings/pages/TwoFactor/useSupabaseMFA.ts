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

  // Storage key for persisting enrolling factor across page refreshes
  const ENROLLING_FACTOR_STORAGE_KEY = "onelink_mfa_enrolling_factor";

  // Helper to save enrolling factor to localStorage
  const saveEnrollingFactor = useCallback((factor: MFATotpFactor) => {
    try {
      localStorage.setItem(
        ENROLLING_FACTOR_STORAGE_KEY,
        JSON.stringify(factor),
      );
    } catch (e) {
      console.warn("[MFA] Failed to save enrolling factor to localStorage:", e);
    }
  }, []);

  // Helper to load enrolling factor from localStorage
  const loadEnrollingFactorFromStorage =
    useCallback((): MFATotpFactor | null => {
      try {
        const stored = localStorage.getItem(ENROLLING_FACTOR_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as MFATotpFactor;
        }
      } catch (e) {
        console.warn(
          "[MFA] Failed to load enrolling factor from localStorage:",
          e,
        );
      }
      return null;
    }, []);

  // Helper to clear enrolling factor from localStorage
  const clearEnrollingFactorStorage = useCallback(() => {
    try {
      localStorage.removeItem(ENROLLING_FACTOR_STORAGE_KEY);
    } catch (e) {
      console.warn(
        "[MFA] Failed to clear enrolling factor from localStorage:",
        e,
      );
    }
  }, []);

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

    // Try to recover enrolling factor from localStorage if state was lost
    const storedFactor = loadEnrollingFactorFromStorage();
    if (storedFactor && storedFactor.id && storedFactor.totp) {
      setEnrollingFactor(storedFactor);
      setState("enrolling");
      // Restore QR code data
      const qr = getSafeQrCodeValue({
        uri: storedFactor.totp?.uri,
        secret: storedFactor.totp?.secret,
        qr_code: storedFactor.totp?.qr_code,
      });
      if (qr) {
        setQrCodeData(qr);
      }
    }
  }, [loadFactors, loadEnrollingFactorFromStorage]);

  const enroll = useCallback(async () => {
    await submit(async () => {
      console.log("[MFA] ===== ENROLLMENT START =====");
      const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;

      // Try enrollment directly (fast path)
      console.log("[MFA] Calling enroll()...");
      let result = await mfaClient.enroll({
        factorType: "totp",
      });
      console.log("[MFA] Enroll response:", {
        hasError: !!result.error,
        hasData: !!result.data,
        errorMessage:
          result.error instanceof Error
            ? result.error.message
            : String(result.error),
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
            // Resume with existing factor - continue below with result.data
            console.log("[MFA] Resuming with existing unverified factor");
          } else {
            // No factor data in response - check localStorage for previously stored factor
            const storedFactor = loadEnrollingFactorFromStorage();
            if (storedFactor && storedFactor.id) {
              // We have a stored factor ID - try to unenroll it first, then retry
              console.log(
                "[MFA] Found stored factor ID, attempting to unenroll before retry...",
              );
              try {
                await mfaClient.unenroll({ factorId: storedFactor.id });
                console.log(
                  "[MFA] Successfully unenrolled stored factor, retrying enrollment...",
                );
                // Clear localStorage since we deleted the factor
                clearEnrollingFactorStorage();
                // Retry enrollment now that we've cleaned up
                const retryResult = await mfaClient.enroll({
                  factorType: "totp",
                });
                if (retryResult.error) {
                  throw retryResult.error;
                }
                result = retryResult;
              } catch (unenrollError) {
                // Unenroll failed - factor might already be deleted or verified
                // Try to resume with stored factor data if we have it
                if (storedFactor.totp) {
                  console.log(
                    "[MFA] Unenroll failed, resuming with stored factor data",
                  );
                  result = {
                    data: {
                      id: storedFactor.id,
                      factor_type: storedFactor.factor_type,
                      friendly_name: storedFactor.friendly_name,
                      created_at: storedFactor.created_at,
                      uri: storedFactor.totp.uri,
                      secret: storedFactor.totp.secret,
                      qr_code: storedFactor.totp.qr_code,
                    } as MFAEnrollResponse,
                    error: undefined,
                  };
                } else {
                  // No factor data, can't resume
                  console.error(
                    "[MFA] Cannot unenroll or resume:",
                    unenrollError,
                  );
                  throw unenrollError;
                }
              }
            } else {
              // No stored factor - try to clean up any unverified factors we can find
              // First, try to get verified factors and see if there's anything to clean
              console.log(
                "[MFA] 422 error - attempting to clean up unverified factors...",
              );

              try {
                // Try to list factors - this only returns verified ones, but worth checking
                const { data: existingFactors } = await mfaClient.listFactors();

                // If we have verified factors, unenroll them (user might want fresh start)
                if (existingFactors?.totp && existingFactors.totp.length > 0) {
                  console.log("[MFA] Found verified factors, cleaning up...");
                  await Promise.allSettled(
                    existingFactors.totp
                      .filter((f) => f.id)
                      .map((f) => mfaClient.unenroll({ factorId: f.id! })),
                  );
                }
              } catch (cleanupError) {
                console.warn("[MFA] Cleanup attempt failed:", cleanupError);
              }

              // Now try enrollment again after cleanup
              console.log("[MFA] Retrying enrollment after cleanup attempt...");
              const retryResult = await mfaClient.enroll({
                factorType: "totp",
              });

              if (retryResult.error) {
                const retryFactorData = retryResult.data as
                  | MFAEnrollResponse
                  | undefined;
                if (
                  retryFactorData &&
                  (retryFactorData.uri ||
                    retryFactorData.secret ||
                    retryFactorData.totp)
                ) {
                  // Got factor data on retry - use it
                  console.log("[MFA] Got factor data on retry after cleanup");
                  result = { data: retryFactorData, error: undefined };
                } else {
                  // Still failing - unverified factor exists but we can't see it via API
                  // User needs to delete it manually via SQL
                  console.error(
                    "[MFA] Cannot resume - unverified factor exists but not accessible via API",
                  );
                  toast.error(
                    "An unverified 2FA factor is blocking enrollment. Please delete it from Supabase dashboard (auth.mfa_factors table) or contact support.",
                  );
                  throw retryResult.error;
                }
              } else {
                // Retry succeeded - use retry result
                result = retryResult;
              }
            }
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
      // 1. { totp: { qr_code, uri, secret, ... }, id: "..." } (ID at top level!)
      // 2. { id, qr_code, uri, secret, ... } (direct factor object)
      // 3. { totp: { id, qr_code, uri, secret, ... } } (ID inside totp)
      console.log("[MFA] Parsing enrollment response...");
      const response = result.data as MFAEnrollResponse;
      const totpData = response?.totp;
      const directData = response && !totpData ? response : null;

      console.log("[MFA] Response structure:", {
        hasResponse: !!response,
        hasTotpData: !!totpData,
        hasDirectData: !!directData,
        responseId: response?.id,
        totpDataId: totpData?.id,
        directDataId: directData?.id,
        fullResponse: JSON.stringify(response, null, 2),
      });

      // Factor ID can be at top level (response.id) OR inside totp (totpData.id)
      // Prefer top-level ID, fallback to totpData.id
      const factorId = response?.id ?? totpData?.id ?? directData?.id;

      if (!factorId) {
        console.error(
          "[MFA] CRITICAL: No factor ID found anywhere in response!",
          {
            responseId: response?.id,
            totpDataId: totpData?.id,
            directDataId: directData?.id,
            response,
            totpData,
            directData,
          },
        );
        toast.error(
          "Failed to get factor ID from enrollment. Please try again.",
        );
        throw new Error("No factor ID in enrollment response");
      }

      console.log(
        "[MFA] Factor ID found:",
        factorId,
        "(from",
        response?.id ? "top-level" : "totp object",
        ")",
      );

      const factor: MFATotpFactor = {
        id: factorId, // We know it exists from check above
        friendly_name:
          response?.friendly_name ?? totpData?.friendly_name ?? null,
        created_at: response?.created_at ?? totpData?.created_at,
        factor_type: response?.factor_type ?? totpData?.factor_type ?? "totp",
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

      console.log("[MFA] Built factor object:", {
        id: factor.id,
        hasTotp: !!factor.totp,
        hasUri: !!factor.totp?.uri,
        hasSecret: !!factor.totp?.secret,
      });

      console.log("[MFA] Setting enrolling factor state:", {
        factorId: factor.id,
        hasTotp: !!factor.totp,
        hasUri: !!factor.totp?.uri,
        hasSecret: !!factor.totp?.secret,
      });
      setEnrollingFactor(factor);
      setState("enrolling");

      // Save to localStorage so we can recover if state is lost
      console.log("[MFA] Saving factor to localStorage...");
      if (!factor.id) {
        console.error("[MFA] CRITICAL ERROR: Factor has no ID!", factor);
        toast.error("Failed to save factor ID. Please try again.");
        throw new Error("Factor has no ID");
      } else {
        console.log("[MFA] Saving factor ID to localStorage:", factor.id);
        saveEnrollingFactor(factor);

        // Verify it was saved
        const verifySaved = loadEnrollingFactorFromStorage();
        if (!verifySaved?.id) {
          console.error(
            "[MFA] CRITICAL ERROR: Factor ID not saved to localStorage!",
            {
              attemptedSave: factor.id,
              retrievedFromStorage: verifySaved,
            },
          );
        } else {
          console.log(
            "[MFA] ✓ Factor ID successfully saved to localStorage:",
            verifySaved.id,
          );
        }
      }

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
        console.log("[MFA] Setting QR code data (length:", qr.length, ")");
        setQrCodeData(qr);
      }

      console.log("[MFA] ===== ENROLLMENT SUCCESS =====", {
        factorId: factor.id,
        state: "enrolling",
        hasQrCode: !!qr,
        localStorageCheck: loadEnrollingFactorFromStorage()?.id,
      });
      toast.success(t("settings_2fa_setup_started"));
    });
  }, [
    submit,
    t,
    saveEnrollingFactor,
    loadEnrollingFactorFromStorage,
    clearEnrollingFactorStorage,
  ]);

  const verifyEnrollment = useCallback(
    async (code: string) => {
      console.log("[MFA] ===== VERIFICATION START =====", {
        codeLength: code.length,
        enrollingFactorId: enrollingFactor?.id,
        qrCodeDataLength: qrCodeData.length,
      });

      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      await submit(async () => {
        const mfaClient = supabase.auth.mfa as unknown as SupabaseMFAClient;

        // Get factor ID - use enrollingFactor if available, otherwise try to recover it
        let factorId = enrollingFactor?.id;
        console.log("[MFA] Initial factor ID check:", {
          fromState: enrollingFactor?.id,
          fromStateExists: !!enrollingFactor,
        });

        if (!factorId) {
          console.log("[MFA] Factor ID not in state, checking localStorage...");
          // State was lost - check localStorage first
          const storedFactor = loadEnrollingFactorFromStorage();
          console.log("[MFA] localStorage check:", {
            hasStoredFactor: !!storedFactor,
            storedFactorId: storedFactor?.id,
            storedFactorKeys: storedFactor ? Object.keys(storedFactor) : [],
            localStorageRaw: localStorage.getItem(ENROLLING_FACTOR_STORAGE_KEY),
          });

          if (storedFactor?.id) {
            factorId = storedFactor.id;
            console.log(
              "[MFA] ✓ Recovered factor ID from localStorage:",
              factorId,
            );
          } else if (qrCodeData) {
            // We have QR code displayed but no factor ID - this shouldn't happen
            // Try to reload from localStorage one more time (might be a timing issue)
            console.warn(
              "[MFA] ⚠️ QR code displayed but no factor ID - attempting recovery...",
              {
                qrCodeDataLength: qrCodeData.length,
                qrCodeDataPreview: qrCodeData.substring(0, 50),
              },
            );
            const retryStored = loadEnrollingFactorFromStorage();
            console.log("[MFA] Retry localStorage check:", {
              hasRetryStored: !!retryStored,
              retryStoredId: retryStored?.id,
            });

            if (retryStored?.id) {
              factorId = retryStored.id;
              console.log("[MFA] ✓ Recovered factor ID on retry:", factorId);
            } else {
              // QR code is displayed but we can't recover factor ID
              // This means enrollment happened but factor ID wasn't saved properly
              console.error(
                "[MFA] ❌ CRITICAL: QR code displayed but factor ID not in localStorage!",
                {
                  qrCodeDataExists: !!qrCodeData,
                  localStorageEmpty: !localStorage.getItem(
                    ENROLLING_FACTOR_STORAGE_KEY,
                  ),
                  allLocalStorageKeys: Object.keys(localStorage).filter(
                    (k) => k.includes("mfa") || k.includes("2fa"),
                  ),
                },
              );
              toast.error(
                "2FA setup state was lost. Please refresh the page - the QR code should reappear with the correct setup.",
              );
              throw new Error(
                "Cannot recover factor ID - QR code displayed but no factor ID stored",
              );
            }
          } else {
            // No QR code and no factor ID - user needs to start over
            console.error(
              "[MFA] ❌ Cannot recover factor ID - no QR code and no localStorage",
              {
                hasQrCodeData: !!qrCodeData,
                hasLocalStorage: !!localStorage.getItem(
                  ENROLLING_FACTOR_STORAGE_KEY,
                ),
              },
            );
            toast.error(
              "2FA setup state was lost. Please click 'Enable 2FA' again to start over.",
            );
            throw new Error("Cannot recover factor ID - state lost");
          }
        }

        console.log("[MFA] Using factor ID for verification:", factorId);

        console.log("[MFA] Calling verify() with:", {
          factorId,
          codeLength: code.length,
        });
        const { error } = await mfaClient.verify({
          factorId,
          code,
        });

        if (error) {
          console.error("[MFA] ❌ Verification failed:", error);
          toast.error(t("settings_2fa_code_incorrect"));
          throw error;
        }

        console.log("[MFA] ===== VERIFICATION SUCCESS =====");
        toast.success(t("settings_2fa_activated"));
        setEnrollingFactor(null);
        setQrCodeData("");
        setState("active");
        clearEnrollingFactorStorage(); // Clear stored factor on success
        await loadFactors();
      });

      return true;
    },
    [
      enrollingFactor,
      submit,
      t,
      loadFactors,
      loadEnrollingFactorFromStorage,
      clearEnrollingFactorStorage,
      qrCodeData,
    ],
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
        setEnrollingFactor(null);
        setQrCodeData("");
        setState("inactive");
        clearEnrollingFactorStorage(); // Clear stored factor when disabling
        await loadFactors();
      });
    },
    [submit, t, loadFactors, clearEnrollingFactorStorage],
  );

  // Reset stuck enrollment state - clears localStorage and attempts cleanup
  const resetEnrollment = useCallback(async () => {
    clearEnrollingFactorStorage();
    setEnrollingFactor(null);
    setQrCodeData("");
    setState("inactive");

    // Try to reload factors to see current state
    await loadFactors();

    toast.info(
      "Enrollment state cleared. If you still see errors, you may need to manually delete unverified factors from Supabase dashboard.",
    );
  }, [clearEnrollingFactorStorage, loadFactors]);

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
    resetEnrollment,
    reload: loadFactors,
  };
}
