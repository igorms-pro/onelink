import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PrivacySecuritySection() {
  const { t } = useTranslation();

  const handleChangePassword = () => {
    // TODO: Open change password modal/page
    console.log("Change password clicked");
  };

  const handle2FA = () => {
    // TODO: Open 2FA modal/page
    console.log("2FA clicked");
  };

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_privacy_security")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <button
          onClick={handleChangePassword}
          className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
        >
          {t("settings_change_password")}
        </button>
        <button
          onClick={handle2FA}
          className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
        >
          {t("settings_two_factor")}
        </button>
        <button className="w-full text-left text-sm text-red-600 dark:text-red-300 hover:underline cursor-pointer">
          {t("settings_delete_account")}
        </button>
      </div>
    </section>
  );
}
