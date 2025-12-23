import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/use-media-query";
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
import type { DropRow } from "../../types";
import { AlertTriangle } from "lucide-react";

interface DeleteDropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drop: DropRow | null;
  onConfirm: () => Promise<void>;
}

export function DeleteDropModal({
  open,
  onOpenChange,
  drop,
  onConfirm,
}: DeleteDropModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Reset checkbox when modal opens/closes or drop changes
  useEffect(() => {
    if (open) {
      setConfirmChecked(false);
    }
  }, [open, drop?.id]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) {
      return;
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = drop?.is_active ?? false;
  const isConfirmRequired = isActive;
  const canDelete = !isConfirmRequired || confirmChecked;

  const content = (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("dashboard_content_drops_delete_description", {
          defaultValue:
            "Are you sure you want to delete this drop? This action cannot be undone.",
          dropLabel: drop?.label || "",
        })}
      </p>

      {drop && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3">
          <p className="font-medium text-gray-900 dark:text-white">
            {drop.emoji ? `${drop.emoji} ` : ""}
            {drop.label}
          </p>
        </div>
      )}

      {isActive && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-900 dark:text-red-100 text-sm">
                {t("dashboard_content_drops_delete_active_warning_title", {
                  defaultValue: "This drop is currently active",
                })}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {t("dashboard_content_drops_delete_active_warning", {
                  defaultValue:
                    "Deleting this drop will break any shared links. Anyone who tries to access this drop will see an error.",
                })}
              </p>
            </div>
          </div>
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-red-600 dark:text-red-400 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 dark:focus:ring-red-400 cursor-pointer"
            />
            <span className="text-sm text-red-900 dark:text-red-100 group-hover:text-red-950 dark:group-hover:text-red-50">
              {t("dashboard_content_drops_delete_confirm_checkbox", {
                defaultValue:
                  "I understand that deleting this active drop will break shared links",
              })}
            </span>
          </label>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => handleOpenChange(false)}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("common_cancel", { defaultValue: "Cancel" })}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading || !canDelete}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? t("common_deleting", { defaultValue: "Deleting..." })
          : t("common_delete")}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-red-600 dark:text-red-400">
              {t("dashboard_content_drops_delete_confirm")}
            </DrawerTitle>
            <DrawerDescription>
              {t("dashboard_content_drops_delete_warning", {
                defaultValue: "This action cannot be undone.",
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">
            {t("dashboard_content_drops_delete_confirm")}
          </DialogTitle>
          <DialogDescription>
            {t("dashboard_content_drops_delete_warning", {
              defaultValue: "This action cannot be undone.",
            })}
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
