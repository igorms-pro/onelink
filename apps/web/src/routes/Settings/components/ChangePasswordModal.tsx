import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChangePasswordForm } from "./ChangePasswordForm";

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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitState = (isLoading: boolean) => {
    setSubmitting(isLoading);
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && submitting) {
      return;
    }
    onOpenChange(next);
  };

  const form = (
    <ChangePasswordForm
      open={open}
      onClose={handleClose}
      onSuccess={() => onOpenChange(false)}
      onLoadingChange={handleSubmitState}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings_change_password_title")}</DialogTitle>
            <DialogDescription>
              {t("settings_change_password_description")}
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("settings_change_password_title")}</DrawerTitle>
          <DrawerDescription>
            {t("settings_change_password_description")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{form}</div>
      </DrawerContent>
    </Drawer>
  );
}
