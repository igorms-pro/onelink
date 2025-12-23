import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Shield } from "lucide-react";
import { useSupabaseMFA } from "@/routes/Settings/pages/TwoFactor/useSupabaseMFA";

type MFAChallengeProps = {
  onVerified?: () => void;
};

export function MFAChallenge({ onVerified }: MFAChallengeProps) {
  const { t } = useTranslation();
  const { startChallenge, verifyChallenge, submitting, factors, loading } =
    useSupabaseMFA();
  const [code, setCode] = useState("");

  useEffect(() => {
    // Only start challenge if factors are loaded and user has MFA enabled
    // Don't start if still loading or if no factors exist
    if (!loading && factors?.totp && factors.totp.length > 0) {
      void startChallenge();
    }
  }, [startChallenge, factors, loading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await verifyChallenge(code);
    if (success) {
      setCode("");
      onVerified?.();
      // We are rendered outside of the Router context (inside AuthProvider),
      // so we can't use useNavigate here. A direct location change is fine
      // after successful MFA verification.
      window.location.assign("/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("auth_mfa_title", "Two-factor authentication")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(
                "auth_mfa_description",
                "Enter the 6-digit code from your authenticator app to continue.",
              )}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="mfa-challenge-form"
        >
          <div>
            <label
              htmlFor="mfa-code"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("auth_mfa_code_label", "Authentication code")}
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-lg tracking-[0.4em] text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="••••••"
              data-testid="mfa-code-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-purple-600 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="mfa-verify-button"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {submitting
                ? t("auth_mfa_verifying", "Verifying...")
                : t("auth_mfa_verify_button", "Verify and continue")}
            </span>
          </button>

          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            {t(
              "auth_mfa_backup_hint",
              "If you can't access your authenticator app, contact support to recover your account.",
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
