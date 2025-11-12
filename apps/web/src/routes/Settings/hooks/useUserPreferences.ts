import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
// import { supabase } from "@/lib/supabase"; // TODO: Uncomment when table is ready
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // TODO: Replace with actual Supabase call when table is ready
        // const { data, error } = await supabase
        //   .from("user_preferences")
        //   .select("*")
        //   .eq("user_id", user.id)
        //   .single();

        // For now, load from localStorage as fallback
        const stored = localStorage.getItem(`preferences_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (mounted) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Save preferences
  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return;

    setSaving(true);
    const updated = { ...preferences, ...newPreferences };

    try {
      // TODO: Replace with actual Supabase call when table is ready
      // const { error } = await supabase
      //   .from("user_preferences")
      //   .upsert({
      //     user_id: user.id,
      //     ...updated,
      //     updated_at: new Date().toISOString(),
      //   });

      // For now, save to localStorage as fallback
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updated));

      setPreferences(updated);
      toast.success(t("settings_preferences_saved"));
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(t("settings_preferences_save_error"));
    } finally {
      setSaving(false);
    }
  };

  // Update single preference
  const updatePreference = async (
    key: keyof UserPreferences,
    value: boolean,
  ) => {
    await savePreferences({ [key]: value });
  };

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    savePreferences,
  };
}
