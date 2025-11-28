import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

interface DisableTwoFactorSectionProps {
  onDisable: (password: string) => void;
  isDisabling: boolean;
}

export function DisableTwoFactorSection({
  onDisable,
  isDisabling,
}: DisableTwoFactorSectionProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDisable = () => {
    onDisable(password);
  };

  return (
    <div
      className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm"
      data-testid="disable-two-factor-section"
    >
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
              data-testid="disable-password-input"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              data-testid="toggle-password-visibility-button"
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
          onClick={handleDisable}
          disabled={isDisabling || !password}
          data-testid="disable-2fa-button"
          className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisabling
            ? t("settings_2fa_disabling")
            : t("settings_2fa_disable_button")}
        </button>
      </div>
    </div>
  );
}
