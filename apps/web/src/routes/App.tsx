import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";

export default function App() {
  const { user, loading } = useAuth();
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
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Don't show onboarding if redirecting
  if (loading || user) {
    return null;
  }

  // Show onboarding carousel only
  return <OnboardingCarousel onComplete={() => {}} />;
}
