import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface UpgradeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function UpgradeConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
}: UpgradeConfirmationModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      // Modal will close when redirect happens
    } catch {
      setIsLoading(false);
      // Error is handled by parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-purple-500/10 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("upgrade_confirm_title", { defaultValue: "Upgrade to Pro?" })}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("upgrade_confirm_description", {
            defaultValue:
              "You'll be redirected to Stripe to complete your payment. Your subscription will start immediately after payment.",
          })}
        </p>
      </div>
      <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 space-y-2">
        <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
          {t("upgrade_confirm_benefits_title", {
            defaultValue: "Pro features include:",
          })}
        </p>
        <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
          <li>
            •{" "}
            {t("upgrade_confirm_benefit_unlimited", {
              defaultValue: "Unlimited links and drops",
            })}
          </li>
          <li>
            •{" "}
            {t("upgrade_confirm_benefit_domain", {
              defaultValue: "Custom domain support",
            })}
          </li>
          <li>
            •{" "}
            {t("upgrade_confirm_benefit_analytics", {
              defaultValue: "Advanced analytics",
            })}
          </li>
          <li>
            •{" "}
            {t("upgrade_confirm_benefit_support", {
              defaultValue: "Priority support",
            })}
          </li>
        </ul>
      </div>
    </div>
  );

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        onClick={handleClose}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {t("upgrade_confirm_cancel", { defaultValue: "Cancel" })}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {t("upgrade_confirm_loading", { defaultValue: "Redirecting..." })}
          </>
        ) : (
          <>
            {t("upgrade_confirm_continue", {
              defaultValue: "Continue to Checkout",
            })}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-purple-600 dark:text-purple-400">
              {t("upgrade_confirm_title", { defaultValue: "Upgrade to Pro?" })}
            </DrawerTitle>
            <DrawerDescription>
              {t("upgrade_confirm_description", {
                defaultValue:
                  "You'll be redirected to Stripe to complete your payment.",
              })}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-purple-600 dark:text-purple-400">
            {t("upgrade_confirm_title", { defaultValue: "Upgrade to Pro?" })}
          </DialogTitle>
          <DialogDescription>
            {t("upgrade_confirm_description", {
              defaultValue:
                "You'll be redirected to Stripe to complete your payment.",
            })}
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
