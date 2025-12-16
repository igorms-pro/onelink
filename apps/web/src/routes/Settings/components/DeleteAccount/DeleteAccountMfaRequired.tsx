import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountMfaRequiredProps {
  onClose: () => void;
}

export function DeleteAccountMfaRequired({
  onClose,
}: DeleteAccountMfaRequiredProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEnable2FA = () => {
    onClose();
    navigate("/settings/2fa");
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 p-4"
        data-testid="delete-account-mfa-required-message"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              {t("settings_delete_account_mfa_requires_2fa")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          data-testid="delete-account-cancel-button"
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {t("common_cancel")}
        </button>
        <button
          type="button"
          onClick={handleEnable2FA}
          data-testid="delete-account-enable-2fa-button"
          className="px-4 py-2.5 rounded-lg bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer"
        >
          {t("settings_delete_account_enable_2fa_cta")}
        </button>
      </div>
    </div>
  );
}
