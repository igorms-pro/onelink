import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordValidationRules } from "./PasswordValidationRules";

interface ChangePasswordFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  className?: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM);
      setErrors({});
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [open, onLoadingChange]);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setLoadingState = (state: boolean) => {
    setLoading(state);
    onLoadingChange?.(state);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.currentPassword) {
      nextErrors.currentPassword = t(
        "settings_change_password_current_required",
      );
    }

    if (!formData.newPassword) {
      nextErrors.newPassword = t("settings_change_password_new_required");
    } else if (formData.newPassword.length < 8) {
      nextErrors.newPassword = t("settings_change_password_min_length");
    } else if (formData.newPassword === formData.currentPassword) {
      nextErrors.newPassword = t("settings_change_password_different");
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = t(
        "settings_change_password_confirm_required",
      );
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = t("settings_change_password_match");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoadingState(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        throw new Error("User not found");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: formData.currentPassword,
      });

      if (signInError) {
        setErrors({
          currentPassword: t("settings_change_password_current_invalid"),
        });
        setLoadingState(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        toast.error(t("settings_change_password_update_failed"));
        setLoadingState(false);
        return;
      }

      toast.success(t("settings_change_password_success"));
      setFormData(INITIAL_FORM);
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("settings_change_password_update_failed");
      toast.error(errorMessage);
    } finally {
      setLoadingState(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
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
        disabled={loading}
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
          disabled={loading}
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
        disabled={loading}
        error={errors.confirmPassword}
        placeholder={t("settings_change_password_confirm_placeholder")}
        data-testid="confirm-password-input"
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          data-testid="cancel-button"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common_cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          data-testid="submit-button"
          className="flex-1 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading
            ? t("settings_change_password_updating")
            : t("settings_change_password_submit")}
        </button>
      </div>
    </form>
  );
}
