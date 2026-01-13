import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";
import { getOrCreateProfile } from "../lib/profile";

export default function App() {
  const { user, loading, checkingMFA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(false);

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
    // Don't redirect if we're checking MFA - wait for MFA challenge to complete
    if (loading || checkingMFA || !user) {
      return;
    }

    // Don't redirect if we're already on /welcome or /auth
    const currentPath = location.pathname;
    if (currentPath === "/welcome" || currentPath === "/auth") {
      return;
    }

    // Check if user has a profile and redirect accordingly
    const checkProfileAndRedirect = async () => {
      setCheckingProfile(true);
      try {
        const profile = await getOrCreateProfile(user.id);
        if (profile) {
          // User has a profile - redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // User doesn't have a profile - redirect to welcome page
          navigate("/welcome", { replace: true });
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        // On error, redirect to welcome page as fallback
        navigate("/welcome", { replace: true });
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileAndRedirect();
  }, [user, loading, checkingMFA, navigate, location.pathname]);

  // Don't show onboarding if redirecting, checking MFA, checking profile, or user is logged in
  if (loading || checkingMFA || checkingProfile || user) {
    return null;
  }

  // Show onboarding carousel only
  return <OnboardingCarousel onComplete={() => {}} />;
}
