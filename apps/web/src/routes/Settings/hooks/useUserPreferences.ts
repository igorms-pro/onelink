import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";

export interface UserPreferences {
  email_notifications: boolean;
  weekly_digest: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  email_notifications: true,
  weekly_digest: false,
  marketing_emails: false,
  product_updates: true,
};

export function useUserPreferences() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const { loading, execute } = useAsyncOperation();
  const { submitting, submit } = useAsyncSubmit();

  // Load preferences
  useEffect(() => {
    if (!user?.id) return;

    execute(async () => {
      try {
        // Load from Supabase
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          // If table doesn't exist or other error, use defaults and show error
          console.error("Error loading preferences from Supabase:", error);
          toast.error(
            t("settings_preferences_load_error", {
              defaultValue: "Failed to load preferences. Using defaults.",
            }),
          );
          setPreferences(DEFAULT_PREFERENCES);
          return;
        }

        if (data) {
          // Preferences exist in database
          setPreferences({
            email_notifications:
              data.email_notifications ??
              DEFAULT_PREFERENCES.email_notifications,
            weekly_digest:
              data.weekly_digest ?? DEFAULT_PREFERENCES.weekly_digest,
            marketing_emails:
              data.marketing_emails ?? DEFAULT_PREFERENCES.marketing_emails,
            product_updates:
              data.product_updates ?? DEFAULT_PREFERENCES.product_updates,
          });
        } else {
          // No preferences found, create default entry
          const { error: insertError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: user.id,
              ...DEFAULT_PREFERENCES,
            });

          if (insertError) {
            console.error("Error creating default preferences:", insertError);
            toast.error(t("settings_preferences_save_error"));
            setPreferences(DEFAULT_PREFERENCES);
          } else {
            setPreferences(DEFAULT_PREFERENCES);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error(
          t("settings_preferences_load_error", {
            defaultValue: "Failed to load preferences. Using defaults.",
          }),
        );
        setPreferences(DEFAULT_PREFERENCES);
      }
    });
  }, [user?.id, execute, t]);

  // Save preferences
  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return;
    // Prevent multiple simultaneous saves
    if (submitting) {
      return;
    }

    await submit(async () => {
      // Calculate updated preferences before state update
      const updated = { ...preferences, ...newPreferences };
      const previousPreferences = preferences;

      // Update state optimistically
      setPreferences(updated);

      // Save to Supabase
      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          email_notifications: updated.email_notifications,
          weekly_digest: updated.weekly_digest,
          marketing_emails: updated.marketing_emails,
          product_updates: updated.product_updates,
        },
        {
          onConflict: "user_id",
        },
      );

      if (error) {
        console.error("Error saving preferences to Supabase:", error);
        // Revert to previous state on error
        setPreferences(previousPreferences);
        throw error; // Will be caught by submit error handler
      }

      toast.success(t("settings_preferences_saved"));
    }).catch((error) => {
      console.error("Error saving preferences:", error);
      toast.error(t("settings_preferences_save_error"));
    });
  };

  // Update single preference
  const updatePreference = async (
    key: keyof UserPreferences,
    value: boolean,
  ) => {
    // Prevent multiple simultaneous updates
    if (submitting) {
      return;
    }
    await savePreferences({ [key]: value });
  };

  return {
    preferences,
    loading,
    saving: submitting,
    updatePreference,
    savePreferences,
  };
}
