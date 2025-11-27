import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import {
  QRCodeDisplay,
  BackupCodesDisplay,
  VerifyCodeForm,
  DisableTwoFactorSection,
  TwoFactorActiveStatus,
} from "./TwoFactor";

type TwoFactorState = "disabled" | "setup" | "active";

export default function TwoFactorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<TwoFactorState>("disabled");
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeData, setQrCodeData] = useState("");
  const [secret, setSecret] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setState("disabled");
      setLoading(false);
    }, 500);
  }, []);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const mockSecret = "JBSWY3DPEHPK3PXP";
      const mockEmail = user?.email || "user@example.com";
      const mockIssuer = "OneLink";
      const mockQrData = `otpauth://totp/${encodeURIComponent(mockIssuer)}:${encodeURIComponent(mockEmail)}?secret=${mockSecret}&issuer=${encodeURIComponent(mockIssuer)}`;

      setSecret(mockSecret);
      setQrCodeData(mockQrData);

      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      );
      setBackupCodes(codes);
      setState("setup");
      setShowBackupCodes(true);
      toast.success(t("settings_2fa_setup_started"));
    } catch (error) {
      toast.error(t("settings_2fa_setup_failed"));
      console.error("Failed to enable 2FA:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error(t("settings_2fa_code_invalid"));
      return;
    }

    setLoading(true);
    try {
      if (verificationCode.length === 6) {
        setState("active");
        toast.success(t("settings_2fa_activated"));
      } else {
        toast.error(t("settings_2fa_code_incorrect"));
      }
    } catch (error) {
      toast.error(t("settings_2fa_verification_failed"));
      console.error("Failed to verify code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (password: string) => {
    if (!password) {
      toast.error(t("settings_2fa_password_required"));
      return;
    }

    setIsDisabling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setState("disabled");
      toast.success(t("settings_2fa_disabled"));
    } catch (error) {
      toast.error(t("settings_2fa_disable_failed"));
      console.error("Failed to disable 2FA:", error);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setLoading(true);
    try {
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      );
      setBackupCodes(codes);
      setShowBackupCodes(true);
      toast.success(t("settings_2fa_backup_codes_regenerated"));
    } catch (error) {
      toast.error(t("settings_2fa_backup_codes_regenerate_failed"));
      console.error("Failed to regenerate backup codes:", error);
    } finally {
      setLoading(false);
    }
  };

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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_settings")}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
              {t("settings_2fa_title")}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {t("settings_2fa_description")}
          </p>
        </div>

        {/* Disabled State */}
        {state === "disabled" && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("settings_2fa_not_enabled")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t("settings_2fa_not_enabled_description")}
              </p>
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("settings_2fa_setting_up")
                  : t("settings_2fa_enable")}
              </button>
            </div>
          </div>
        )}

        {/* Setup State */}
        {state === "setup" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
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
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Active State */}
        {state === "active" && (
          <div className="space-y-6">
            <TwoFactorActiveStatus />

            <BackupCodesDisplay
              backupCodes={backupCodes}
              showBackupCodes={showBackupCodes}
              setShowBackupCodes={setShowBackupCodes}
              onRegenerate={handleRegenerateBackupCodes}
              loading={loading}
              variant="active"
            />

            <DisableTwoFactorSection
              onDisable={handleDisable2FA}
              isDisabling={isDisabling}
            />
          </div>
        )}
      </main>
    </div>
  );
}
