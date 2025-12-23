import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PasswordInput } from "./PasswordInput";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.current = t("settings_change_password_current_required");
    }

    if (!newPassword) {
      newErrors.new = t("settings_change_password_new_required");
    } else if (newPassword.length < 8) {
      newErrors.new = t("settings_change_password_min_length");
    } else if (newPassword === currentPassword) {
      newErrors.new = t("settings_change_password_different");
    }

    if (!confirmPassword) {
      newErrors.confirm = t("settings_change_password_confirm_required");
    } else if (confirmPassword !== newPassword) {
      newErrors.confirm = t("settings_change_password_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user?.email) return;

    setIsLoading(true);
    setErrors({});

    try {
      // First, verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setErrors({ current: t("settings_change_password_current_invalid") });
        toast.error(t("settings_change_password_current_invalid"));
        setIsLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(t("settings_change_password_update_failed"));
        setIsLoading(false);
        return;
      }

      toast.success(t("settings_change_password_success"));
      onOpenChange(false);

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("settings_change_password_update_failed");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onOpenChange(false);
    }
  };

  const content = (
    <form
      onSubmit={handleSubmit}
      data-testid="settings-change-password-form"
      className="space-y-4"
    >
      <PasswordInput
        id="current-password"
        label={t("settings_change_password_current_label")}
        value={currentPassword}
        onChange={setCurrentPassword}
        disabled={isLoading}
        error={errors.current}
        placeholder={t("settings_change_password_current_placeholder")}
        data-testid="change-password-current-input"
      />

      <PasswordInput
        id="new-password"
        label={t("settings_change_password_new_label")}
        value={newPassword}
        onChange={setNewPassword}
        disabled={isLoading}
        error={errors.new}
        placeholder={t("settings_change_password_new_placeholder")}
        hint={
          newPassword && newPassword.length < 8
            ? t("settings_change_password_min_length_hint")
            : undefined
        }
        data-testid="change-password-new-input"
      />

      <PasswordInput
        id="confirm-password"
        label={t("settings_change_password_confirm_label")}
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={isLoading}
        error={errors.confirm}
        placeholder={t("settings_change_password_confirm_placeholder")}
        data-testid="change-password-confirm-input"
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common_cancel")}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? t("settings_change_password_updating")
            : t("settings_change_password_submit")}
        </button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="max-h-[90vh]"
          data-testid="change-password-modal"
        >
          <DrawerHeader>
            <DrawerTitle>{t("settings_change_password_title")}</DrawerTitle>
            <DrawerDescription>
              {t("settings_change_password_description")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1 pb-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        showCloseButton={!isLoading}
        data-testid="change-password-modal"
      >
        <DialogHeader>
          <DialogTitle>{t("settings_change_password_title")}</DialogTitle>
          <DialogDescription>
            {t("settings_change_password_description")}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
