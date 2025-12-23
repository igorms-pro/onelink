import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useSupabaseMFA } from "@/routes/Settings/pages/TwoFactor/useSupabaseMFA";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function PrivacySecuritySection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { state: mfaState, loading: loadingMfaStatus } = useSupabaseMFA();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const hasMfaEnabled = mfaState === "active";

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
            data-testid="settings-two-factor"
            onClick={handle2FA}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_two_factor")}
          </button>
          <button
            data-testid="settings-change-password"
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_change_password")}
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
          <div className="space-y-2">
            {!loadingMfaStatus && !hasMfaEnabled && (
              <div
                data-testid="settings-delete-account-mfa-notice"
                className="rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-3 mb-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      {t("settings_delete_account_mfa_required_notice")}
                    </p>
                    <button
                      data-testid="settings-enable-2fa-from-delete-notice"
                      onClick={handle2FA}
                      className="mt-2 text-sm font-medium text-orange-700 dark:text-orange-300 hover:underline cursor-pointer"
                    >
                      {t("settings_delete_account_enable_2fa_cta")} →
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              data-testid="settings-delete-account"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={!loadingMfaStatus && !hasMfaEnabled}
              className={`w-full text-left text-sm ${
                !loadingMfaStatus && !hasMfaEnabled
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed line-through"
                  : "text-red-600 dark:text-red-300 hover:underline cursor-pointer"
              }`}
            >
              {t("settings_delete_account")}
            </button>
          </div>
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
      <DeleteAccountModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
      <ChangePasswordModal
        open={isChangePasswordModalOpen}
        onOpenChange={setIsChangePasswordModalOpen}
      />
    </>
  );
}
