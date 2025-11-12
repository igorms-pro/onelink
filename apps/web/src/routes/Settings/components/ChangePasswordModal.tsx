import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t(
        "settings_change_password_current_required",
      );
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t("settings_change_password_new_required");
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t("settings_change_password_min_length");
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = t("settings_change_password_different");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "settings_change_password_confirm_required",
      );
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("settings_change_password_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        throw new Error("User not found");
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: formData.currentPassword,
      });

      if (signInError) {
        setErrors({
          currentPassword: t("settings_change_password_current_invalid"),
        });
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        toast.error(t("settings_change_password_update_failed"));
        setLoading(false);
        return;
      }

      toast.success(t("settings_change_password_success"));
      onOpenChange(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("settings_change_password_update_failed");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  };

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="current-password"
          className="text-sm font-medium text-gray-900 dark:text-white"
        >
          {t("settings_change_password_current_label")}
        </label>
        <input
          id="current-password"
          type="password"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData({ ...formData, currentPassword: e.target.value })
          }
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          placeholder={t("settings_change_password_current_placeholder")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.currentPassword}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="new-password"
          className="text-sm font-medium text-gray-900 dark:text-white"
        >
          {t("settings_change_password_new_label")}
        </label>
        <input
          id="new-password"
          type="password"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          placeholder={t("settings_change_password_new_placeholder")}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.newPassword}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("settings_change_password_min_length_hint")}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="text-sm font-medium text-gray-900 dark:text-white"
        >
          {t("settings_change_password_confirm_label")}
        </label>
        <input
          id="confirm-password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          placeholder={t("settings_change_password_confirm_placeholder")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );

  const formActions = (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("common_cancel")}
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading
          ? t("settings_change_password_updating")
          : t("settings_change_password_submit")}
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings_change_password_title")}</DialogTitle>
            <DialogDescription>
              {t("settings_change_password_description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {formFields}
            <DialogFooter>{formActions}</DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("settings_change_password_title")}</DrawerTitle>
          <DrawerDescription>
            {t("settings_change_password_description")}
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4">
          {formFields}
        </form>
        <DrawerFooter>{formActions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
