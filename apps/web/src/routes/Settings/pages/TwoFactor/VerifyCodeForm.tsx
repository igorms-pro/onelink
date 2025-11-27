import { useTranslation } from "react-i18next";

interface VerifyCodeFormProps {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onVerify: () => void;
  loading: boolean;
}

export function VerifyCodeForm({
  verificationCode,
  setVerificationCode,
  onVerify,
  loading,
}: VerifyCodeFormProps) {
  const { t } = useTranslation();

  return (
    <>
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
        onClick={onVerify}
        disabled={loading || verificationCode.length !== 6}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? t("settings_2fa_verifying")
          : t("settings_2fa_verify_and_activate")}
      </button>
    </>
  );
}
