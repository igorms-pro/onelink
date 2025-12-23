import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";

export default function App() {
  const { user, loading, checkingMFA } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Send a test event when App component loads (only once on mount)
    if (isPostHogLoaded()) {
      trackEvent("app_loaded", {
        has_user: !!user,
        path: window.location.pathname,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount

  useEffect(() => {
    // Redirect logged-in users to dashboard (like Linktree)
    // But don't redirect if we're checking MFA - wait for MFA challenge to complete
    if (!loading && !checkingMFA && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, checkingMFA, navigate]);

  // Don't show onboarding if redirecting or checking MFA
  if (loading || checkingMFA || user) {
    return null;
  }

  // Show onboarding carousel only
  return <OnboardingCarousel onComplete={() => {}} />;
}
