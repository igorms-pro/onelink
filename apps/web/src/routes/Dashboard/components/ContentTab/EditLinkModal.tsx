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
import type { LinkRow } from "@/components/LinksList";

interface EditLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkRow | null;
  onSave: (newLabel: string) => Promise<void>;
}

export function EditLinkModal({
  open,
  onOpenChange,
  link,
  onSave,
}: EditLinkModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update label when link changes
  useEffect(() => {
    if (link) {
      setLabel(link.label);
      setError(null);
    }
  }, [link]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) {
      return;
    }
    if (!next) {
      setLabel("");
      setError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!link) return;

    const trimmedLabel = label.trim();
    if (trimmedLabel.length < 3) {
      setError(t("common_label_required"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(trimmedLabel);
      handleOpenChange(false);
    } catch {
      setError(t("common_update_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="link-label"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          {t("common_new_label")}
        </label>
        <input
          id="link-label"
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
          placeholder={t("common_new_label")}
          disabled={isLoading}
          autoFocus
          minLength={3}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
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
        onClick={handleSubmit}
        disabled={isLoading || label.trim().length < 3}
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
              {t("dashboard_content_links_edit_description", {
                defaultValue: "Update the link label",
              })}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">{formContent}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>{t("common_edit")}</DialogTitle>
          <DialogDescription>
            {t("dashboard_content_links_edit_description", {
              defaultValue: "Update the link label",
            })}
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
