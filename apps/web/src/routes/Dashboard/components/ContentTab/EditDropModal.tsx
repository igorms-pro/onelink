import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import type { DropRow } from "../../types";

interface EditDropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drop: DropRow;
  onSave: (label: string) => Promise<void>;
}

export function EditDropModal({
  open,
  onOpenChange,
  drop,
  onSave,
}: EditDropModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [label, setLabel] = useState(drop.label);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or drop changes
  useEffect(() => {
    if (open) {
      setLabel(drop.label);
      setError(null);
    }
  }, [open, drop.label]);

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) {
      return;
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedLabel = label.trim();

    // Validation
    if (!trimmedLabel) {
      setError(t("common_label_required"));
      return;
    }

    if (trimmedLabel.length < 3) {
      setError(t("common_label_min_length", { min: 3 }));
      return;
    }

    if (trimmedLabel === drop.label) {
      // No changes, just close
      handleClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(trimmedLabel);
      handleClose();
    } catch {
      // Error handling is done in onSave
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="drop-label"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("common_new_label")}
        </label>
        <input
          id="drop-label"
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !isLoading &&
              label.trim() &&
              label.trim().length >= 3
            ) {
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
          placeholder={t("dashboard_content_drops_label_placeholder")}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("common_label_min_length_hint", {
            defaultValue: "Label must be at least 3 characters",
            min: 3,
          })}
        </p>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("common_cancel")}
      </button>
      <button
        type="button"
        disabled={isLoading || !label.trim() || label.trim().length < 3}
        onClick={handleSubmit}
        className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading
          ? t("common_saving", { defaultValue: "Saving..." })
          : t("common_save", { defaultValue: "Save" })}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{t("common_edit")}</DrawerTitle>
            <DrawerDescription>
              {t("dashboard_content_drops_edit_description", {
                defaultValue: "Update your drop label",
              })}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="drop-label-mobile"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("common_new_label")}
                </label>
                <input
                  id="drop-label-mobile"
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !isLoading &&
                      label.trim() &&
                      label.trim().length >= 3
                    ) {
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                  placeholder={t("dashboard_content_drops_label_placeholder")}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("common_label_min_length_hint", {
                    defaultValue: "Label must be at least 3 characters",
                    min: 3,
                  })}
                </p>
              </div>
            </div>
          </div>
          <DrawerFooter>{footerContent}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>{t("common_edit")}</DialogTitle>
          <DialogDescription>
            {t("dashboard_content_drops_edit_description", {
              defaultValue: "Update your drop label",
            })}
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
