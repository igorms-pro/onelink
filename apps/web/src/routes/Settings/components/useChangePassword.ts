import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function useChangePassword() {
  const { t } = useTranslation();
  const { submitting, submit } = useAsyncSubmit();
  const [errors, setErrors] = useState<ChangePasswordErrors>({});

  const validate = useCallback(
    (formData: ChangePasswordFormData): boolean => {
      const nextErrors: ChangePasswordErrors = {};

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
    },
    [t],
  );

  const handleSubmit = useCallback(
    async (formData: ChangePasswordFormData): Promise<boolean> => {
      if (!validate(formData)) {
        return false;
      }

      try {
        await submit(async () => {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user?.email) {
            throw new Error("User not found");
          }

          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: userData.user.email,
              password: formData.currentPassword,
            },
          );

          if (signInError) {
            setErrors({
              currentPassword: t("settings_change_password_current_invalid"),
            });
            throw signInError;
          }

          const { error: updateError } = await supabase.auth.updateUser({
            password: formData.newPassword,
          });

          if (updateError) {
            toast.error(t("settings_change_password_update_failed"));
            throw updateError;
          }

          toast.success(t("settings_change_password_success"));
          setErrors({});
        });
        return true;
      } catch {
        return false;
      }
    },
    [validate, submit, t],
  );

  return {
    submitting,
    errors,
    setErrors,
    handleSubmit,
    validate,
  };
}
