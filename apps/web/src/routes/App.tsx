import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";
import { getOrCreateProfile } from "../lib/profile";
import { isLandingDomain, isAppDomain } from "../lib/domain";
import { APP_URL } from "../lib/constants";

export default function App() {
  const { user, loading, checkingMFA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Redirect app routes from landing domain to app domain
  // Skip in development/localhost - allow everything to work locally
  useEffect(() => {
    const host = window.location.host;
    const pathname = location.pathname;

    // Skip redirects in development/localhost
    const isLocalhost =
      host === "localhost" ||
      host.startsWith("localhost:") ||
      host === "127.0.0.1" ||
      host.startsWith("127.0.0.1:");

    if (isLocalhost) {
      // In dev, allow everything to work without redirects
      return;
    }

    // Skip redirect logic if we're on the app domain - this prevents infinite loops
    // The app domain should handle its own routing without redirecting
    // This is critical because isLandingDomain("app.getonelink.io") would incorrectly return true
    // since "app.getonelink.io" ends with ".getonelink.io"
    if (isAppDomain(host)) {
      return;
    }

    // List of routes that belong to landing page (these should NOT be accessible on landing domain from web app)
    const landingRoutes = [
      "/",
      "/features",
      "/pricing",
      "/privacy",
      "/terms",
      "/auth",
    ];

    // List of routes that should ONLY be accessible on app domain
    // These include ALL authenticated routes
    const appRoutes = [
      "/dashboard",
      "/settings",
      "/welcome",
      "/checkout",
      "/pricing", // Pricing page is also on app domain
    ];

    // If we're on landing domain and trying to access root, redirect to landing
    if (isLandingDomain(host) && pathname === "/") {
      window.location.replace(`https://${host}/`);
      return;
    }

    // If we're on landing domain and trying to access any landing route, redirect to landing
    if (isLandingDomain(host) && landingRoutes.includes(pathname)) {
      window.location.replace(`https://${host}${pathname}`);
      return;
    }

    // Check if current route is an app route (dashboard, settings, etc.)
    const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

    // If we're on landing domain and trying to access an app route, redirect to app domain
    // This ensures getonelink.io/dashboard redirects to app.getonelink.io/dashboard
    if (isLandingDomain(host) && isAppRoute) {
      const redirectUrl = `${APP_URL}${pathname}${window.location.search}`;
      window.location.replace(redirectUrl);
      return;
    }

    // Profiles (/:slug) are allowed on landing domain - no redirect needed
    // They will be proxied by vercel.json rewrites
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
