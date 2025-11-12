import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

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

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
        placeholder={placeholder}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

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
      <PasswordField
        id="current-password"
        label={t("settings_change_password_current_label")}
        value={formData.currentPassword}
        onChange={(value) => updateField("currentPassword", value)}
        disabled={loading}
        error={errors.currentPassword}
        placeholder={t("settings_change_password_current_placeholder")}
      />

      <PasswordField
        id="new-password"
        label={t("settings_change_password_new_label")}
        value={formData.newPassword}
        onChange={(value) => updateField("newPassword", value)}
        disabled={loading}
        error={errors.newPassword}
        placeholder={t("settings_change_password_new_placeholder")}
        hint={t("settings_change_password_min_length_hint")}
      />

      <PasswordField
        id="confirm-password"
        label={t("settings_change_password_confirm_label")}
        value={formData.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
        disabled={loading}
        error={errors.confirmPassword}
        placeholder={t("settings_change_password_confirm_placeholder")}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common_cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
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
