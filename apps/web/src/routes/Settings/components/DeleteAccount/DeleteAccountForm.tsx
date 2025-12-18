import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface DeleteAccountFormProps {
  mfaCode: string;
  onMfaCodeChange: (value: string) => void;
  confirmChecked: boolean;
  onConfirmChange: (checked: boolean) => void;
  error: string | null;
  isLoading: boolean;
  isValid: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function DeleteAccountForm({
  mfaCode,
  onMfaCodeChange,
  confirmChecked,
  onConfirmChange,
  error,
  isLoading,
  isValid,
  onSubmit,
  onCancel,
}: DeleteAccountFormProps) {
  const { t } = useTranslation();

  const handleMfaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    onMfaCodeChange(value);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      data-testid="delete-account-form"
    >
      {/* MFA code field */}
      <div>
        <label
          htmlFor="delete-mfa-code"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          {t("settings_delete_account_mfa_label")}
        </label>
        <input
          id="delete-mfa-code"
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={mfaCode}
          onChange={handleMfaCodeChange}
          disabled={isLoading}
          data-testid="delete-account-mfa-input"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-widest font-mono text-lg"
          placeholder={t("settings_delete_account_mfa_placeholder")}
          required
        />
      </div>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3">
        <input
          id="delete-confirm"
          type="checkbox"
          checked={confirmChecked}
          onChange={(e) => onConfirmChange(e.target.checked)}
          disabled={isLoading}
          data-testid="delete-account-confirm-checkbox"
          className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          required
        />
        <label
          htmlFor="delete-confirm"
          className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {t("settings_delete_account_confirm_text")}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="delete-account-cancel-button"
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t("common_cancel")}
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          data-testid="delete-account-submit-button"
          className="px-4 py-2.5 rounded-lg bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("settings_delete_account_button")}
        </button>
      </div>
    </form>
  );
}
