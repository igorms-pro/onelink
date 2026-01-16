/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { supabase } from "./supabase";
import { createUserSession } from "./sessionTracking";
import { MFAChallenge } from "@/components/MFAChallenge";
import { trackUserSignedIn, trackUserSignedOut } from "./posthog-events";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  checkingMFA: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signInWithOAuth: (
    provider: "google" | "apple" | "facebook",
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingMFA, setCheckingMFA] = useState(false);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sessionInitialized = false;

    // According to Supabase docs, onAuthStateChange will fire with INITIAL_SESSION
    // when the session is restored from localStorage (on page refresh)
    // This is the primary way to detect session restoration
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      // Update session state for all events
      // INITIAL_SESSION: fired when session is restored from storage (on refresh)
      // SIGNED_IN: fired when user signs in
      // TOKEN_REFRESHED: fired when access token is refreshed
      // SIGNED_OUT: fired when user signs out
      setSession(s ?? null);

      // Mark session as initialized when we receive INITIAL_SESSION or SIGNED_IN/SIGNED_OUT
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT"
      ) {
        sessionInitialized = true;
        setLoading(false);
      }

      // Clean up URL after successful sign-in
      // With PKCE flow, the code comes as a query parameter (?code=...)
      // With detectSessionInUrl: true, Supabase auto-exchanges it
      // Clean up both hash (implicit) and query params (PKCE) for safety
      if (event === "SIGNED_IN") {
        const url = new URL(window.location.href);
        const isMagicLinkRedirect = url.hash || url.searchParams.has("code");

        // Check for OAuth error in URL (e.g., ?error=access_denied)
        const oauthError = url.searchParams.get("error");
        const oauthErrorDescription = url.searchParams.get("error_description");

        if (oauthError) {
          // Handle OAuth callback errors
          let errorMessage = "Failed to sign in with Google. Please try again.";

          if (
            oauthError === "access_denied" ||
            oauthError === "user_cancelled"
          ) {
            errorMessage = "Sign in with Google was cancelled.";
          } else if (oauthErrorDescription) {
            // Use the error description if available
            errorMessage = oauthErrorDescription;
          }

          toast.error(errorMessage);

          // Clean up error params from URL
          url.searchParams.delete("error");
          url.searchParams.delete("error_description");
          url.searchParams.delete("error_code");
          window.history.replaceState(null, "", url.toString());
          return;
        }

        if (isMagicLinkRedirect) {
          window.history.replaceState(null, "", window.location.pathname);
          // Immediately dismiss any toasts (like "check your email") when magic link is clicked
          // We'll check MFA and show modal if needed, so don't show success toast
          toast.dismiss();
        }

        // After a successful sign-in, IMMEDIATELY check if the user has MFA factors
        // This check blocks rendering until complete to show MFA modal before dashboard
        // Only show challenge if session is aal1 (not aal2 - already verified)
        setCheckingMFA(true);
        (async () => {
          try {
            const { data: aalData, error: aalError } =
              await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
              console.error("[Auth] Error getting AAL:", aalError);
              setCheckingMFA(false);
              return; // Don't show challenge if we can't get AAL
            }

            if (!aalData) {
              setCheckingMFA(false);
              return; // No AAL data, don't show challenge
            }

            // Show challenge ONLY if:
            // 1. Current level is aal1 (not fully authenticated)
            // 2. Next level is aal2 (MFA is required)
            // 3. User actually has MFA factors enabled
            const needsMFA =
              aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2";

            if (!needsMFA) {
              // User doesn't need MFA (either already verified or doesn't have MFA enabled)
              setCheckingMFA(false);
              return;
            }

            // Only proceed if MFA is actually needed
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) {
              console.error("[Auth] Error listing MFA factors:", error);
              setCheckingMFA(false);
              return; // Don't show challenge if we can't list factors
            }

            // Only show challenge if user has TOTP factors enabled
            if (data?.totp && data.totp.length > 0) {
              setShowMFAChallenge(true);
              // Keep checkingMFA true while MFA challenge is shown
              // This prevents dashboard from rendering
            } else {
              // If no factors exist, user doesn't have MFA enabled - don't show challenge
              setCheckingMFA(false);
            }
          } catch (err) {
            console.error("[Auth] Unexpected error checking MFA factors:", err);
            setCheckingMFA(false);
            // Don't show challenge on error
          }
        })();
      }

      // Track session on successful sign-in
      // Only do this for SIGNED_IN, not for INITIAL_SESSION (which happens on refresh)
      // createUserSession now checks for existing sessions and updates last_activity instead of creating duplicates
      // Run asynchronously without blocking the auth flow
      if (event === "SIGNED_IN" && s?.user) {
        // Don't await - run in background to avoid blocking auth flow
        createUserSession({
          userId: s.user.id,
        }).catch((error) => {
          console.error("[Auth] Error creating session:", error);
        });

        // Track sign-in in PostHog (non-blocking)
        trackUserSignedIn(s.user.id);
      }

      // Track sign-out
      if (event === "SIGNED_OUT") {
        trackUserSignedOut();
      }
    });

    // Also get session immediately as a fallback
    // This helps in case onAuthStateChange doesn't fire immediately
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("[Auth] Error getting session:", error);
      }

      if (data.session) {
        setSession(data.session);
      }

      // Safety timeout: if INITIAL_SESSION doesn't fire within 1 second,
      // we assume there's no session and set loading to false
      setTimeout(() => {
        if (!mounted || sessionInitialized) return;
        setLoading(false);
      }, 1000);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      session,
      user,
      loading,
      checkingMFA,
      async signInWithEmail(email: string) {
        const startTime = Date.now();
        const userAgent =
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
        const origin =
          typeof window !== "undefined" ? window.location.origin : "unknown";

        try {
          console.log("[Auth] signInWithOtp attempt:", {
            email: email.substring(0, 3) + "***", // Partial email for privacy
            origin,
            userAgent: userAgent.substring(0, 50), // First 50 chars
            timestamp: new Date().toISOString(),
          });

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin + "/dashboard" },
          });

          const duration = Date.now() - startTime;

          if (error) {
            // Log to Sentry with context
            Sentry.captureException(new Error(error.message), {
              tags: {
                auth_error: true,
                error_type: "signInWithOtp",
                error_status: error.status?.toString() || "unknown",
              },
              extra: {
                email: email.substring(0, 3) + "***",
                origin,
                userAgent: userAgent.substring(0, 100),
                duration,
                errorName: error.name,
              },
            });

            return { error: error.message };
          }

          console.log("[Auth] signInWithOtp success:", {
            email: email.substring(0, 3) + "***",
            duration,
            timestamp: new Date().toISOString(),
          });

          return {};
        } catch (err) {
          // Catch network errors (CORS, fetch failed, etc.)
          const duration = Date.now() - startTime;
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Network error. Please check your connection and try again.";

          // Log network error to Sentry
          Sentry.captureException(
            err instanceof Error ? err : new Error(errorMessage),
            {
              tags: {
                auth_error: true,
                error_type: "signInWithOtp_network",
                error_name: err instanceof Error ? err.name : "Unknown",
              },
              extra: {
                email: email.substring(0, 3) + "***",
                origin,
                userAgent: userAgent.substring(0, 100),
                duration,
                error: err instanceof Error ? err.toString() : String(err),
              },
            },
          );

          return { error: errorMessage };
        }
      },
      async signInWithOAuth(provider: "google" | "apple" | "facebook") {
        // Username is already stored in localStorage by Auth.tsx if it came from URL param
        // The Welcome page will read it from localStorage after OAuth callback
        // No need to pass it via queryParams - localStorage persists across redirects
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          });

          if (error) {
            // Handle specific error types
            let errorMessage = error.message;

            // Check for common OAuth error patterns
            const errorMsgLower = error.message.toLowerCase();
            if (
              errorMsgLower.includes("configuration") ||
              errorMsgLower.includes("not configured")
            ) {
              errorMessage =
                "OAuth provider is not configured. Please contact support.";
            } else if (
              errorMsgLower.includes("network") ||
              errorMsgLower.includes("fetch")
            ) {
              errorMessage =
                "Network error. Please check your connection and try again.";
            } else if (
              errorMsgLower.includes("cancelled") ||
              errorMsgLower.includes("denied")
            ) {
              errorMessage = "Sign in was cancelled.";
            } else if (
              errorMsgLower.includes("email") &&
              errorMsgLower.includes("already")
            ) {
              errorMessage =
                "An account with this email already exists. Please sign in with email instead.";
            }

            return { error: errorMessage };
          }

          // OAuth redirect will happen automatically
          // After OAuth callback:
          // 1. User is redirected to /dashboard
          // 2. App.tsx checks if profile exists
          // 3. If no profile → redirects to /welcome
          // 4. Welcome.tsx reads username from localStorage (USERNAME_STORAGE_KEY)
          return {};
        } catch (err) {
          // Handle unexpected errors
          const errorMessage =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred. Please try again.";
          return { error: errorMessage };
        }
      },
      async signOut() {
        await supabase.auth.signOut();
        // Note: trackUserSignedOut is called in onAuthStateChange when SIGNED_OUT fires
      },
    };
  }, [session, loading, checkingMFA]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Show loading overlay while checking MFA */}
      {checkingMFA && !showMFAChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <p className="text-gray-900 dark:text-white">
                Verifying authentication...
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Show MFA challenge modal when needed */}
      {showMFAChallenge && (
        <div data-testid="mfa-challenge-container">
          <MFAChallenge
            onVerified={() => {
              setShowMFAChallenge(false);
              setCheckingMFA(false);
            }}
          />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
