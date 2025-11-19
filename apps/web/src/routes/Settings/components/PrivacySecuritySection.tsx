import { useState } from "react";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function PrivacySecuritySection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handle2FA = () => {
    navigate("/settings/2fa");
  };

  return (
    <>
      <section
        data-testid="settings-privacy-security-section"
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("settings_privacy_security")}
          </h2>
        </div>
        <div className="space-y-3 pl-7">
          <button
            data-testid="settings-change-password"
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_change_password")}
          </button>
          <button
            data-testid="settings-two-factor"
            onClick={handle2FA}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_two_factor")}
          </button>
          <button
            data-testid="settings-sign-out"
            onClick={async () => {
              await signOut();
              navigate("/auth");
            }}
            className="w-full text-left text-sm text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
          >
            {t("dashboard_header_sign_out")}
          </button>
          <div className="pt-2"></div>
          <button
            data-testid="settings-delete-account"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full text-left text-sm text-red-600 dark:text-red-300 hover:underline cursor-pointer"
          >
            {t("settings_delete_account")}
          </button>
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
            <Link
              to="/privacy"
              className="text-sm text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300 cursor-pointer"
            >
              {t("footer_privacy")}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300 cursor-pointer"
            >
              {t("footer_terms")}
            </Link>
          </div>
        </div>
      </section>
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
      <DeleteAccountModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </>
  );
}
