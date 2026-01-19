import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";
import { getOrCreateProfile } from "../lib/profile";
import { isAppDomain, isLandingDomain } from "../lib/domain";
import { APP_URL } from "../lib/constants";

export default function App() {
  const { user, loading, checkingMFA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Redirect app routes from landing domain to app domain
  useEffect(() => {
    const host = window.location.host;
    const pathname = location.pathname;

    // List of routes that belong to landing page
    const landingRoutes = [
      "/",
      "/features",
      "/pricing",
      "/privacy",
      "/terms",
      "/auth",
    ];

    // List of routes that should only be accessible on app domain
    const appRoutes = ["/dashboard", "/settings", "/welcome", "/checkout"];

    // If we're on landing domain and trying to access root or landing routes, redirect to landing
    if (
      isLandingDomain(host) &&
      landingRoutes.includes(pathname) &&
      pathname !== "/"
    ) {
      // These routes should be handled by landing page, but if we're here, redirect to landing
      window.location.replace(`https://${host}${pathname}`);
      return;
    }

    // If we're on landing domain and trying to access root, redirect to landing
    if (isLandingDomain(host) && pathname === "/") {
      window.location.replace(`https://${host}/`);
      return;
    }

    // Check if current route is an app route
    const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

    // If we're on landing domain and trying to access an app route, redirect to app domain
    if (isLandingDomain(host) && isAppRoute && !isAppDomain(host)) {
      const redirectUrl = `${APP_URL}${pathname}${window.location.search}`;
      window.location.replace(redirectUrl);
      return;
    }
  }, [location.pathname, location.search]);

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
