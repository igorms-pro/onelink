import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordValidationRules } from "./PasswordValidationRules";
import { useChangePassword } from "./useChangePassword";

interface ChangePasswordFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  className?: string;
}

const INITIAL_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordForm({
  open,
  onClose,
  onSuccess,
  onLoadingChange,
  className,
}: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const {
    submitting,
    errors,
    setErrors,
    handleSubmit: handlePasswordSubmit,
  } = useChangePassword();

  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM);
      setErrors({});
      onLoadingChange?.(false);
    }
  }, [open, onLoadingChange, setErrors]);

  useEffect(() => {
    onLoadingChange?.(submitting);
  }, [submitting, onLoadingChange]);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await handlePasswordSubmit(formData);
    if (success) {
      setFormData(INITIAL_FORM);
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("space-y-6", className)}
      data-testid="settings-change-password-form"
    >
      <PasswordInput
        id="current-password"
        label={t("settings_change_password_current_label")}
        value={formData.currentPassword}
        onChange={(value) => updateField("currentPassword", value)}
        disabled={submitting}
        error={errors.currentPassword}
        placeholder={t("settings_change_password_current_placeholder")}
        data-testid="current-password-input"
      />

      <div className="space-y-2">
        <PasswordInput
          id="new-password"
          label={t("settings_change_password_new_label")}
          value={formData.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          disabled={submitting}
          error={errors.newPassword}
          placeholder={t("settings_change_password_new_placeholder")}
          data-testid="new-password-input"
        />
        <PasswordStrengthIndicator password={formData.newPassword} />
        <PasswordValidationRules password={formData.newPassword} />
      </div>

      <PasswordInput
        id="confirm-password"
        label={t("settings_change_password_confirm_label")}
        value={formData.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
        disabled={submitting}
        error={errors.confirmPassword}
        placeholder={t("settings_change_password_confirm_placeholder")}
        data-testid="confirm-password-input"
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          data-testid="cancel-button"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common_cancel")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-button"
          className="flex-1 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {submitting
            ? t("settings_change_password_updating")
            : t("settings_change_password_submit")}
        </button>
      </div>
    </form>
  );
}
