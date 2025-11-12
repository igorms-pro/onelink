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
import { DeleteAccountWarning, DeleteAccountForm } from "./DeleteAccount";

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

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError(null);
  };

  const handleConfirmChange = (checked: boolean) => {
    setConfirmChecked(checked);
    setError(null);
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
    <div className="space-y-4">
      <DeleteAccountWarning />
      <DeleteAccountForm
        password={password}
        onPasswordChange={handlePasswordChange}
        confirmChecked={confirmChecked}
        onConfirmChange={handleConfirmChange}
        error={error}
        isLoading={isLoading}
        isValid={isFormValid}
        onSubmit={handleSubmit}
        onCancel={handleClose}
      />
    </div>
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
