import { Bell, Mail, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWindowSize } from "usehooks-ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
}

function SettingsContent({
  isMobile = false,
  onSignOut,
}: {
  isMobile?: boolean;
  onSignOut?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`space-y-6 ${isMobile ? "px-4 pb-4" : ""} max-h-[90vh] overflow-y-auto`}
    >
      {/* Notifications */}
      <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings_notifications")}
          </h3>
        </div>
        <div className="space-y-3 pl-7">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings_email_notifications")}
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings_weekly_digest")}
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </section>

      {/* Email Preferences */}
      <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings_email_preferences")}
          </h3>
        </div>
        <div className="space-y-3 pl-7">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings_marketing_emails")}
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings_product_updates")}
            </span>
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
          </label>
        </div>
      </section>

      {/* Privacy & Security */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings_privacy_security")}
          </h3>
        </div>
        <div className="space-y-3 pl-7">
          <button className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline">
            {t("settings_change_password")}
          </button>
          <button className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline">
            {t("settings_two_factor")}
          </button>
          {isMobile && onSignOut && (
            <button
              className="w-full text-left text-sm text-red-600 dark:text-red-300 hover:underline"
              onClick={onSignOut}
            >
              {t("dashboard_header_sign_out")}
            </button>
          )}
          <button className="w-full text-left text-sm text-red-600 dark:text-red-300 hover:underline">
            {t("settings_delete_account")}
          </button>
        </div>
      </section>
    </div>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  onSignOut,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const isDesktop = width >= 768; // md breakpoint

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("settings_title")}</DialogTitle>
          </DialogHeader>
          <SettingsContent isMobile={false} onSignOut={onSignOut} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("settings_title")}</DrawerTitle>
        </DrawerHeader>
        <SettingsContent isMobile={true} onSignOut={onSignOut} />
      </DrawerContent>
    </Drawer>
  );
}
