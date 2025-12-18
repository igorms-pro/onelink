import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  DeleteAccountWarning,
  DeleteAccountForm,
  DeleteAccountMfaRequired,
} from "./DeleteAccount";
import { deleteAccount } from "@/lib/deleteAccount";
import { useAuth } from "@/lib/AuthProvider";
import { useSupabaseMFA } from "@/routes/Settings/pages/TwoFactor/useSupabaseMFA";
import { Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
}: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { state: mfaState, loading: loadingMfaStatus } = useSupabaseMFA();
  const [mfaCode, setMfaCode] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMfaEnabled = mfaState === "active";
  const isFormValid = mfaCode.length === 6 && confirmChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteAccount({ mfaCode });

      if (!result.success) {
        let message = result.error || t("settings_delete_account_error");

        // Handle specific MFA error codes
        if (result.error === "MFA_CODE_INVALID") {
          message = t("settings_delete_account_mfa_error_invalid");
        } else if (result.error === "MFA_CODE_REQUIRED") {
          message = t("settings_delete_account_mfa_error_required");
        } else if (result.error === "MFA_NOT_ENABLED") {
          message = t("settings_delete_account_mfa_requires_2fa");
        }

        setError(message);
        toast.error(message);
        return;
      }

      toast.success(t("settings_delete_account_success"));
      onOpenChange(false);

      // Reset form
      setMfaCode("");
      setConfirmChecked(false);

      // Sign out user and redirect to auth page
      await signOut();
      navigate("/auth");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("settings_delete_account_error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaCodeChange = (value: string) => {
    setMfaCode(value);
    setError(null);
  };

  const handleConfirmChange = (checked: boolean) => {
    setConfirmChecked(checked);
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      setMfaCode("");
      setConfirmChecked(false);
      setError(null);
      onOpenChange(false);
    }
  };

  // Show loading state while checking MFA status
  if (loadingMfaStatus) {
    const loadingContent = (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );

    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent
            className="max-h-[90vh]"
            data-testid="delete-account-modal"
          >
            <DrawerHeader>
              <DrawerTitle className="text-red-600 dark:text-red-400">
                {t("settings_delete_account_title")}
              </DrawerTitle>
              <DrawerDescription>
                {t("settings_delete_account_description")}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto flex-1">{loadingContent}</div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-md"
          showCloseButton={!isLoading}
          data-testid="delete-account-modal"
        >
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              {t("settings_delete_account_title")}
            </DialogTitle>
            <DialogDescription>
              {t("settings_delete_account_description")}
            </DialogDescription>
          </DialogHeader>
          {loadingContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Show MFA required view if MFA is not enabled
  const content = (
    <div className="space-y-4">
      <DeleteAccountWarning />
      {!hasMfaEnabled ? (
        <DeleteAccountMfaRequired onClose={handleClose} />
      ) : (
        <DeleteAccountForm
          mfaCode={mfaCode}
          onMfaCodeChange={handleMfaCodeChange}
          confirmChecked={confirmChecked}
          onConfirmChange={handleConfirmChange}
          error={error}
          isLoading={isLoading}
          isValid={isFormValid}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="max-h-[90vh]"
          data-testid="delete-account-modal"
        >
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
      <DialogContent
        className="max-w-md"
        showCloseButton={!isLoading}
        data-testid="delete-account-modal"
      >
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
