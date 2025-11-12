import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Shield,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
// import { supabase } from "@/lib/supabase"; // TODO: Uncomment when 2FA backend is ready

type TwoFactorState = "disabled" | "setup" | "active";

export default function TwoFactorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<TwoFactorState>("disabled");
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeData, setQrCodeData] = useState("");
  const [secret, setSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  // Mock data for now - will be replaced with actual API calls
  useEffect(() => {
    // Simulate loading 2FA status
    setTimeout(() => {
      // TODO: Fetch actual 2FA status from Supabase
      setState("disabled");
      setLoading(false);
    }, 500);
  }, []);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // TODO: Call Supabase Edge Function or RPC to generate TOTP secret
      // For now, generate a mock secret and QR code data
      const mockSecret = "JBSWY3DPEHPK3PXP";
      const mockEmail = user?.email || "user@example.com";
      const mockIssuer = "OneLink";
      const mockQrData = `otpauth://totp/${encodeURIComponent(mockIssuer)}:${encodeURIComponent(mockEmail)}?secret=${mockSecret}&issuer=${encodeURIComponent(mockIssuer)}`;

      setSecret(mockSecret);
      setQrCodeData(mockQrData);

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      );
      setBackupCodes(codes);
      setState("setup");
      setSetupStep(1);
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
      // TODO: Verify code with Supabase Edge Function or RPC
      // For now, accept any 6-digit code for demo
      if (verificationCode.length === 6) {
        setState("active");
        setSetupStep(1);
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

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error(t("settings_2fa_password_required"));
      return;
    }

    setIsDisabling(true);
    try {
      // TODO: Verify password and disable 2FA via Supabase
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setState("disabled");
      setPassword("");
      setShowPassword(false);
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
      // TODO: Regenerate backup codes via Supabase
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

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("settings_2fa_backup_code_copied"));
  };

  const handleCopyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success(t("settings_2fa_backup_codes_copied"));
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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

        {/* Setup State - Step 1 */}
        {state === "setup" && setupStep === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("settings_2fa_setup_step1_title")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t("settings_2fa_setup_step1_description")}
              </p>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                  {qrCodeData && (
                    <QRCodeSVG value={qrCodeData} size={200} level="M" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {t("settings_2fa_scan_qr_code")}
                </p>
              </div>

              {/* Secret Key */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("settings_2fa_secret_key")}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100">
                    {secret}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast.success(t("settings_2fa_secret_copied"));
                    }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t("settings_2fa_secret_key_description")}
                </p>
              </div>

              {/* Backup Codes */}
              {showBackupCodes && backupCodes.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      {t("settings_2fa_backup_codes_title")}
                    </h3>
                    <button
                      onClick={handleCopyAllBackupCodes}
                      className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline"
                    >
                      {t("settings_2fa_copy_all")}
                    </button>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                    {t("settings_2fa_backup_codes_description")}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700"
                      >
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {code}
                        </code>
                        <button
                          onClick={() => handleCopyBackupCode(code)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("settings_2fa_verification_code")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setVerificationCode(value);
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t("settings_2fa_verification_code_description")}
                </p>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("settings_2fa_verifying")
                  : t("settings_2fa_verify_and_activate")}
              </button>
            </div>
          </div>
        )}

        {/* Active State */}
        {state === "active" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  {t("settings_2fa_active")}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t("settings_2fa_active_description")}
              </p>
            </div>

            {/* Backup Codes Section */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("settings_2fa_backup_codes_title")}
                </h2>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("settings_2fa_regenerate_backup_codes")}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t("settings_2fa_backup_codes_description")}
              </p>
              {showBackupCodes && backupCodes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {code}
                      </code>
                      <button
                        onClick={() => handleCopyBackupCode(code)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setShowBackupCodes(true)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {t("settings_2fa_show_backup_codes")}
                </button>
              )}
            </div>

            {/* Disable 2FA Section */}
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                {t("settings_2fa_disable_title")}
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                {t("settings_2fa_disable_warning")}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("settings_2fa_password_confirm")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("settings_2fa_password_placeholder")}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDisable2FA}
                  disabled={isDisabling || !password}
                  className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDisabling
                    ? t("settings_2fa_disabling")
                    : t("settings_2fa_disable_button")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
