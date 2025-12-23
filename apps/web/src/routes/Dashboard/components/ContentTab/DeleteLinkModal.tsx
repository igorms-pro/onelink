import { useState } from "react";
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
import type { LinkRow } from "@/components/LinksList";

interface DeleteLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkRow | null;
  onConfirm: () => Promise<void>;
}

export function DeleteLinkModal({
  open,
  onOpenChange,
  link,
  onConfirm,
}: DeleteLinkModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isLoading, setIsLoading] = useState(false);

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

  const content = (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("dashboard_content_links_delete_description", {
          defaultValue:
            "Are you sure you want to delete this link? This action cannot be undone.",
          linkLabel: link?.label || "",
        })}
      </p>
      {link && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3">
          <p className="font-medium text-gray-900 dark:text-white">
            {link.emoji ? `${link.emoji} ` : ""}
            {link.label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
            {link.url}
          </p>
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
        disabled={isLoading}
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
              {t("dashboard_content_links_delete_confirm")}
            </DrawerTitle>
            <DrawerDescription>
              {t("dashboard_content_links_delete_warning", {
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
            {t("dashboard_content_links_delete_confirm")}
          </DialogTitle>
          <DialogDescription>
            {t("dashboard_content_links_delete_warning", {
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
