import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import {
  generateTOTPSecret,
  generateBackupCodes,
  generateQRCodeData,
  verifyTOTPCode,
} from "./twoFactorUtils";

export type TwoFactorState = "disabled" | "setup" | "active";

interface TwoFactorData {
  enabled: boolean;
  enabled_at: string | null;
  secret?: string; // Only available during setup
  backup_codes?: string[]; // Only available during setup/regeneration
}

export function useTwoFactor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { loading, execute } = useAsyncOperation();
  const { submitting, submit } = useAsyncSubmit();

  const [state, setState] = useState<TwoFactorState>("disabled");
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null,
  );
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeData, setQrCodeData] = useState<string>("");

  // Load 2FA status from database
  const loadTwoFactorStatus = useCallback(async () => {
    if (!user?.id) {
      setState("disabled");
      setTwoFactorData(null);
      return;
    }

    await execute(async () => {
      const { data, error } = await supabase
        .from("user_2fa")
        .select("enabled, enabled_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found, which is fine
        console.error("Error loading 2FA status:", error);
        toast.error(t("settings_2fa_load_failed"));
        setState("disabled");
        setTwoFactorData(null);
        return;
      }

      if (data?.enabled) {
        setState("active");
        setTwoFactorData({
          enabled: true,
          enabled_at: data.enabled_at,
        });
      } else {
        setState("disabled");
        setTwoFactorData(null);
      }
    });
  }, [user?.id, t, execute]);

  useEffect(() => {
    loadTwoFactorStatus();
  }, [loadTwoFactorStatus]);

  // Start 2FA setup
  const startSetup = useCallback(async () => {
    if (!user?.id || !user?.email) {
      toast.error(t("settings_2fa_user_required"));
      return;
    }

    await submit(async () => {
      const newSecret = generateTOTPSecret();
      const codes = generateBackupCodes();
      setSecret(newSecret);
      setBackupCodes(codes);

      // Generate QR code data URL
      const accountName = user.email!; // Already checked above
      const otpAuthUrl = generateQRCodeData(accountName, newSecret);
      setQrCodeData(otpAuthUrl);

      // Store secret and backup codes temporarily (will be saved after verification)
      setState("setup");
      setTwoFactorData({
        enabled: false,
        enabled_at: null,
        secret: newSecret,
        backup_codes: codes,
      });

      toast.success(t("settings_2fa_setup_started"));
    });
  }, [user?.id, user?.email, submit, t]);

  // Verify TOTP code and enable 2FA
  const verifyAndEnable = useCallback(
    async (code: string) => {
      if (!user?.id || !secret) {
        toast.error(t("settings_2fa_setup_required"));
        return false;
      }

      if (!code.trim() || code.length !== 6) {
        toast.error(t("settings_2fa_code_invalid"));
        return false;
      }

      await submit(async () => {
        // Verify the code
        const isValid = verifyTOTPCode(code, secret);

        if (!isValid) {
          toast.error(t("settings_2fa_code_incorrect"));
          throw new Error("Invalid TOTP code");
        }

        // Save to database
        // Note: In production, you should encrypt the secret before storing
        // For now, we store it as-is (RLS protects access)
        const { error } = await supabase.from("user_2fa").upsert(
          {
            user_id: user.id,
            secret: secret, // TODO: Encrypt before storing
            backup_codes: backupCodes, // TODO: Encrypt before storing
            enabled: true,
            enabled_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) {
          console.error("Failed to save 2FA:", error);
          toast.error(t("settings_2fa_activation_failed"));
          throw error;
        }

        setState("active");
        setTwoFactorData({
          enabled: true,
          enabled_at: new Date().toISOString(),
        });

        // Clear temporary setup data
        setSecret("");
        setQrCodeData("");

        toast.success(t("settings_2fa_activated"));
      });

      return true;
    },
    [user?.id, secret, backupCodes, submit, t],
  );

  // Disable 2FA
  const disable = useCallback(
    async (password: string) => {
      if (!user?.id) {
        toast.error(t("settings_2fa_user_required"));
        return false;
      }

      if (!password) {
        toast.error(t("settings_2fa_password_required"));
        return false;
      }

      // Verify password with Supabase Auth
      if (!user.email) {
        toast.error(t("settings_2fa_user_required"));
        return false;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (authError) {
        toast.error(t("settings_2fa_password_incorrect"));
        return false;
      }

      await submit(async () => {
        const { error } = await supabase
          .from("user_2fa")
          .update({
            enabled: false,
            enabled_at: null,
            secret: "", // Clear secret
            backup_codes: [], // Clear backup codes
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Failed to disable 2FA:", error);
          toast.error(t("settings_2fa_disable_failed"));
          throw error;
        }

        setState("disabled");
        setTwoFactorData(null);
        setBackupCodes([]);

        toast.success(t("settings_2fa_disabled"));
      });

      return true;
    },
    [user?.id, user?.email, submit, t],
  );

  // Regenerate backup codes
  const regenerateBackupCodes = useCallback(async () => {
    if (!user?.id || state !== "active") {
      toast.error(t("settings_2fa_not_active"));
      return;
    }

    await submit(async () => {
      const newCodes = generateBackupCodes();
      setBackupCodes(newCodes);

      // Update in database
      const { error } = await supabase
        .from("user_2fa")
        .update({
          backup_codes: newCodes, // TODO: Encrypt before storing
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to regenerate backup codes:", error);
        toast.error(t("settings_2fa_backup_codes_regenerate_failed"));
        return;
      }

      toast.success(t("settings_2fa_backup_codes_regenerated"));
    });
  }, [user?.id, state, generateBackupCodes, submit, t]);

  return {
    state,
    loading,
    submitting,
    secret,
    backupCodes,
    qrCodeData,
    twoFactorData,
    startSetup,
    verifyAndEnable,
    disable,
    regenerateBackupCodes,
    reload: loadTwoFactorStatus,
  };
}
