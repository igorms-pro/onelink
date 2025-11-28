import { useState, useEffect, useRef } from "react";
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
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const { loading, execute } = useAsyncOperation();
  const { submitting, submit } = useAsyncSubmit();
  // Use ref to immediately prevent double clicks (before submitting state updates)
  const isSavingRef = useRef(false);
  // Use ref to prevent multiple simultaneous loads
  const isLoadingRef = useRef(false);
  // Track the last user ID we loaded preferences for
  const lastLoadedUserIdRef = useRef<string | null>(null);

  // Load preferences
  useEffect(() => {
    console.log("[useUserPreferences] useEffect triggered", {
      authLoading,
      userId: user?.id,
      hasUser: !!user,
      isLoadingRef: isLoadingRef.current,
      loading,
      lastLoadedUserId: lastLoadedUserIdRef.current,
    });

    // Wait for auth to finish loading before checking user
    if (authLoading) {
      console.log("[useUserPreferences] Waiting for auth to load...");
      return;
    }

    if (!user?.id) {
      // If no user after auth loaded, set defaults immediately
      console.log("[useUserPreferences] No user, setting defaults");
      setPreferences(DEFAULT_PREFERENCES);
      isLoadingRef.current = false;
      lastLoadedUserIdRef.current = null;
      return;
    }

    // If we already loaded preferences for this user, don't reload
    if (lastLoadedUserIdRef.current === user.id) {
      console.log(
        "[useUserPreferences] Already loaded preferences for this user, skipping...",
      );
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || loading) {
      console.log("[useUserPreferences] Already loading, skipping...");
      return;
    }

    console.log(
      "[useUserPreferences] Starting to load preferences for user:",
      user.id,
    );
    isLoadingRef.current = true;

    // Create AbortController for this specific load
    const abortController = new AbortController();
    const signal = abortController.signal;

    execute(async () => {
      // Check if cancelled before starting
      if (signal.aborted) {
        console.log("[useUserPreferences] Load aborted before start");
        return;
      }

      try {
        console.log(
          "[useUserPreferences] Fetching preferences from Supabase...",
        );
        console.log("[useUserPreferences] Supabase client:", !!supabase);
        console.log("[useUserPreferences] User ID:", user.id);

        // Check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("[useUserPreferences] Current session:", {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id,
          matches: sessionData.session?.user?.id === user.id,
        });

        if (signal.aborted) {
          console.log("[useUserPreferences] Load aborted after session check");
          return;
        }

        // Load from Supabase with timeout
        const queryPromise = supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("[useUserPreferences] Query promise created");

        console.log("[useUserPreferences] Query created, awaiting response...");
        const startTime = Date.now();

        // Add timeout to prevent infinite waiting
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Supabase query timeout after 10s")),
            10000,
          );
        });

        let data, error;
        try {
          const result = await Promise.race([queryPromise, timeoutPromise]);
          data = result.data;
          error = result.error;
          const duration = Date.now() - startTime;
          console.log(
            "[useUserPreferences] ✅ Supabase response received after",
            duration,
            "ms",
          );
        } catch (e) {
          const duration = Date.now() - startTime;
          console.error(
            "[useUserPreferences] ❌ Supabase query failed after",
            duration,
            "ms:",
            e,
          );
          // If timeout, try to abort and use defaults
          if (e instanceof Error && e.message.includes("timeout")) {
            console.error(
              "[useUserPreferences] Query timed out, using defaults",
            );
            setPreferences(DEFAULT_PREFERENCES);
            toast.error("Failed to load preferences: request timed out");
            return;
          }
          throw e;
        }

        console.log(
          "[useUserPreferences] Response data:",
          data ? "HAS DATA" : "NULL",
        );
        console.log(
          "[useUserPreferences] Response error:",
          error
            ? {
                message: error.message,
                code: error.code,
                details: error.details,
              }
            : "NO ERROR",
        );

        if (error) {
          // If table doesn't exist or other error, use defaults and show error
          console.error(
            "[useUserPreferences] Error loading preferences from Supabase:",
            error,
          );
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
          console.log("[useUserPreferences] Found preferences in DB:", data);
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
          console.log("[useUserPreferences] Preferences set:", {
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
          // Mark as loaded for this user
          lastLoadedUserIdRef.current = user.id;
        } else {
          // No preferences found, create default entry
          console.log(
            "[useUserPreferences] No preferences found, creating default entry",
          );
          const { error: insertError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: user.id,
              ...DEFAULT_PREFERENCES,
            });

          if (insertError) {
            console.error(
              "[useUserPreferences] Error creating default preferences:",
              insertError,
            );
            toast.error(t("settings_preferences_save_error"));
            setPreferences(DEFAULT_PREFERENCES);
          } else {
            console.log("[useUserPreferences] Default preferences created");
            setPreferences(DEFAULT_PREFERENCES);
          }
          // Mark as loaded for this user even if we used defaults
          lastLoadedUserIdRef.current = user.id;
        }
      } catch (error) {
        console.error(
          "[useUserPreferences] Exception loading preferences:",
          error,
        );
        toast.error(
          t("settings_preferences_load_error", {
            defaultValue: "Failed to load preferences. Using defaults.",
          }),
        );
        setPreferences(DEFAULT_PREFERENCES);
        // Don't mark as loaded if there was an error - allow retry
      } finally {
        // Always reset loading ref when done
        isLoadingRef.current = false;
        console.log("[useUserPreferences] Load completed, reset isLoadingRef");
      }
    });

    // Cleanup: abort request if component unmounts or dependencies change
    return () => {
      console.log(
        "[useUserPreferences] Cleanup: aborting request and resetting isLoadingRef",
        {
          currentUserId: user?.id,
          lastLoadedUserId: lastLoadedUserIdRef.current,
        },
      );
      abortController.abort();
      isLoadingRef.current = false;
      // Only reset lastLoadedUserId if user actually changed
      if (user?.id !== lastLoadedUserIdRef.current) {
        lastLoadedUserIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]); // Only depend on user.id, not the whole user object or execute/t

  // Save preferences
  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return;
    // Prevent multiple simultaneous saves - check ref immediately (synchronous)
    if (isSavingRef.current || submitting) {
      return;
    }

    // Set ref immediately to prevent double clicks
    isSavingRef.current = true;

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
    })
      .catch((error) => {
        console.error("Error saving preferences:", error);
        toast.error(t("settings_preferences_save_error"));
      })
      .finally(() => {
        // Always reset ref when done
        isSavingRef.current = false;
      });
  };

  // Update single preference
  const updatePreference = async (
    key: keyof UserPreferences,
    value: boolean,
  ) => {
    // Prevent multiple simultaneous updates - check ref immediately
    if (isSavingRef.current || submitting) {
      return;
    }
    await savePreferences({ [key]: value });
  };

  const finalLoading = loading || authLoading;
  console.log("[useUserPreferences] Returning state:", {
    loading,
    authLoading,
    finalLoading,
    hasPreferences: !!preferences,
    preferences,
  });

  return {
    preferences,
    loading: finalLoading, // Include auth loading state
    saving: submitting || isSavingRef.current, // Include ref state for immediate UI feedback
    updatePreference,
    savePreferences,
  };
}
