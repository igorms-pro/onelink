import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  QRCodeDisplay,
  BackupCodesDisplay,
  VerifyCodeForm,
  DisableTwoFactorSection,
  TwoFactorActiveStatus,
} from "./TwoFactor";
import { useSupabaseMFA } from "./TwoFactor/useSupabaseMFA";

export default function TwoFactorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const {
    state: mfaState,
    loading,
    submitting,
    factors,
    qrCodeData,
    enroll,
    verifyEnrollment,
    unenroll,
  } = useSupabaseMFA();

  // Map Supabase MFA state to component state
  const state =
    mfaState === "inactive"
      ? "disabled"
      : mfaState === "enrolling"
        ? "setup"
        : "active";

  // Extract secret from QR code data if available (for display purposes)
  // Supabase MFA QR code contains the secret in the URI
  const secret = qrCodeData
    ? (() => {
        // Extract secret from otpauth:// URI if present
        const secretMatch = qrCodeData.match(/secret=([A-Z0-9]+)/i);
        return secretMatch ? secretMatch[1] : "";
      })()
    : "";

  // Supabase MFA doesn't provide backup codes natively
  // For now, we'll show an empty array or handle it differently
  const backupCodes: string[] = [];

  const handleVerifyCode = async () => {
    const success = await verifyEnrollment(verificationCode);
    if (success) {
      setVerificationCode("");
      // Note: Supabase MFA doesn't provide backup codes, so we don't show them
      // setShowBackupCodes(true);
    }
  };

  const handleEnable2FA = async () => {
    await enroll();
    // Note: Supabase MFA doesn't provide backup codes
    // setShowBackupCodes(true);
  };

  const handleDisable2FA = async (password: string) => {
    // Supabase MFA doesn't require password for unenroll
    // But we keep the password field for user confirmation UI

    void password; // Intentionally unused - kept for UI compatibility
    const totpFactor = factors?.totp?.[0];
    if (totpFactor?.id) {
      await unenroll(totpFactor.id);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    // Supabase MFA doesn't provide backup codes
    // This function is kept for compatibility but does nothing
    // In the future, we could implement custom backup codes if needed
    toast.info(t("settings_2fa_backup_codes_not_available"));
  };

  if (authLoading || !user) {
    return null; // Will redirect via useRequireAuth
  }

  if (loading && state === "disabled") {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
        <Header onSettingsClick={() => navigate("/settings")} />
        <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          data-testid="back-to-settings-button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_settings")}
        </button>

        <div className="mb-8" data-testid="two-factor-page-header">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1
              className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!"
              data-testid="two-factor-page-title"
            >
              {t("settings_2fa_title")}
            </h1>
          </div>
          <p
            className="text-gray-500 dark:text-gray-400"
            data-testid="two-factor-page-description"
          >
            {t("settings_2fa_description")}
          </p>
        </div>

        {/* Disabled State */}
        {state === "disabled" && (
          <div
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
            data-testid="two-factor-disabled-state"
          >
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                data-testid="two-factor-disabled-status"
              >
                {t("settings_2fa_not_enabled")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t("settings_2fa_not_enabled_description")}
              </p>
              <button
                onClick={handleEnable2FA}
                disabled={submitting}
                data-testid="enable-2fa-button"
                className="px-6 py-3 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t("settings_2fa_setting_up")
                  : t("settings_2fa_enable")}
              </button>
            </div>
          </div>
        )}

        {/* Setup State */}
        {state === "setup" && (
          <div className="space-y-6" data-testid="two-factor-setup-state">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2
                className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                data-testid="setup-step1-title"
              >
                {t("settings_2fa_setup_step1_title")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t("settings_2fa_setup_step1_description")}
              </p>

              <QRCodeDisplay qrCodeData={qrCodeData} secret={secret} />

              <BackupCodesDisplay
                backupCodes={backupCodes}
                showBackupCodes={showBackupCodes}
                setShowBackupCodes={setShowBackupCodes}
                variant="setup"
              />

              <VerifyCodeForm
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                onVerify={handleVerifyCode}
                loading={submitting}
              />
            </div>
          </div>
        )}

        {/* Active State */}
        {state === "active" && (
          <div className="space-y-6" data-testid="two-factor-active-state">
            <TwoFactorActiveStatus />

            <BackupCodesDisplay
              backupCodes={backupCodes}
              showBackupCodes={showBackupCodes}
              setShowBackupCodes={setShowBackupCodes}
              onRegenerate={handleRegenerateBackupCodes}
              loading={submitting}
              variant="active"
            />

            <DisableTwoFactorSection
              onDisable={handleDisable2FA}
              isDisabling={submitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}
