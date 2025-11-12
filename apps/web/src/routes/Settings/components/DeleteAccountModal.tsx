import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/use-media-query";
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
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
}: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [password, setPassword] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = password.length > 0 && confirmChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual account deletion API
      // For now, this is a placeholder
      // const { error: deleteError } = await supabase.rpc('delete_user_account', {
      //   password: password
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show success (remove this when API is ready)
      toast.success(t("settings_delete_account_success"));
      onOpenChange(false);

      // Reset form
      setPassword("");
      setConfirmChecked(false);

      // TODO: Sign out user and redirect to home
      // await supabase.auth.signOut();
      // navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("settings_delete_account_error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword("");
      setConfirmChecked(false);
      setError(null);
      onOpenChange(false);
    }
  };

  const content = (
    <>
      <div className="space-y-4">
        {/* Warning message */}
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                {t("settings_delete_account_warning_title")}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {t("settings_delete_account_warning_description")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password field */}
          <div>
            <label
              htmlFor="delete-password"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              {t("settings_delete_account_password_label")}
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t("settings_delete_account_password_placeholder")}
              required
            />
          </div>

          {/* Confirmation checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="delete-confirm"
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => {
                setConfirmChecked(e.target.checked);
                setError(null);
              }}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common_cancel")}
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="px-4 py-2.5 rounded-lg bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("settings_delete_account_button")}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-red-600 dark:text-red-400">
              {t("settings_delete_account_title")}
            </DrawerTitle>
            <DrawerDescription>
              {t("settings_delete_account_description")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">
            {t("settings_delete_account_title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings_delete_account_description")}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
