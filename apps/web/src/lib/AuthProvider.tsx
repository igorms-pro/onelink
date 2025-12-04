/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { createUserSession, logLoginAttempt } from "./sessionTracking";
import { MFAChallenge } from "@/components/MFAChallenge";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sessionInitialized = false;

    // According to Supabase docs, onAuthStateChange will fire with INITIAL_SESSION
    // when the session is restored from localStorage (on page refresh)
    // This is the primary way to detect session restoration
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      console.log("[Auth] State change:", event, s?.user?.email || "No user");

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
        if (url.hash || url.searchParams.has("code")) {
          window.history.replaceState(null, "", window.location.pathname);
        }

        // After a successful sign-in, check if the user has MFA factors
        // If they do, we'll show the MFA challenge screen
        try {
          const { data, error } = await supabase.auth.mfa.listFactors();
          if (error) {
            console.error("[Auth] Error listing MFA factors:", error);
          } else if (data?.totp && data.totp.length > 0) {
            console.log("[Auth] User has MFA factors, showing challenge");
            setShowMFAChallenge(true);
          }
        } catch (err) {
          console.error("[Auth] Unexpected error checking MFA factors:", err);
        }
      }

      // Track session and log login history on successful sign-in
      // Only do this for SIGNED_IN, not for INITIAL_SESSION (which happens on refresh)
      // Run these asynchronously without blocking the auth flow
      if (event === "SIGNED_IN" && s?.user) {
        console.log("[Auth] User signed in:", {
          userId: s.user.id,
          email: s.user.email,
        });
        // Don't await - run in background to avoid blocking auth flow
        createUserSession({
          userId: s.user.id,
        })
          .then(() => {
            console.log("[Auth] Session created in database");
          })
          .catch((error) => {
            console.error("[Auth] Error creating session:", error);
          });

        // Log successful login (also non-blocking)
        logLoginAttempt({
          email: s.user.email || "",
          status: "success",
          userId: s.user.id,
        }).catch((error) => {
          console.error("[Auth] Error logging login attempt:", error);
        });
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
        console.log("[Auth] Fallback session check:", data.session.user.email);
        setSession(data.session);
      }

      // Safety timeout: if INITIAL_SESSION doesn't fire within 1 second,
      // we assume there's no session and set loading to false
      setTimeout(() => {
        if (!mounted || sessionInitialized) return;
        console.log(
          "[Auth] Timeout: INITIAL_SESSION not received, assuming no session",
        );
        setLoading(false);
      }, 1000);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? null,
      loading,
      async signInWithEmail(email: string) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) return { error: error.message };
        return {};
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    };
  }, [session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showMFAChallenge && (
        <MFAChallenge
          onVerified={() => {
            setShowMFAChallenge(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
