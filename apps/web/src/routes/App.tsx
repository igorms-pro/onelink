import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { trackEvent, isPostHogLoaded } from "../lib/posthog";
import { getOrCreateProfile } from "../lib/profile";
import { isLandingDomain, isAppDomain } from "../lib/domain";
import { APP_URL, LANDING_URL } from "../lib/constants";

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

    // If we're on app domain and trying to access a profile route, redirect to landing domain
    // This ensures app.onlnk.io/username redirects to onlnk.io/username
    // BUT: Skip this redirect in localhost/dev - allow profiles to work locally
    if (isAppDomain(host) && !isLocalhost) {
      // List of routes that belong to the app (these should NOT redirect)
      const appRoutes = [
        "/dashboard",
        "/settings",
        "/welcome",
        "/checkout",
        "/pricing",
        "/auth",
      ];

      // Check if current pathname is NOT an app route (likely a profile route)
      const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

      // If it's not an app route and not root, it's probably a profile - redirect to landing
      if (!isAppRoute && pathname !== "/" && pathname.length > 1) {
        const redirectUrl = `${LANDING_URL}${pathname}${window.location.search}`;
        window.location.replace(redirectUrl);
        return;
      }

      // Otherwise, let app domain handle its own routing
      return;
    }

    // If we're on app domain in localhost, skip redirect logic (allow profiles to work locally)
    if (isAppDomain(host) && isLocalhost) {
      return;
    }

    // List of routes that should ONLY be accessible on app domain
    // These include ALL authenticated routes
    const appRoutes = [
      "/dashboard",
      "/settings",
      "/welcome",
      "/checkout",
      "/pricing", // Pricing page is also on app domain
    ];

    // If we're on landing domain, we should NOT be here - this is the web app!
    // The landing domain should serve the landing page project, not this web app
    // If we somehow end up here (misconfigured Vercel), redirect app routes to app domain
    // and let profiles be handled by vercel.json rewrites
    if (isLandingDomain(host)) {
      // Don't redirect if we're already on www.onlnk.io (landing page project)
      // This prevents self-redirection loops
      if (host === "www.onlnk.io") {
        return;
      }

      // If it's an app route, redirect to app domain
      const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));
      if (isAppRoute) {
        const redirectUrl = `${APP_URL}${pathname}${window.location.search}`;
        window.location.replace(redirectUrl);
        return;
      }

      // List of landing page routes that should redirect to www.onlnk.io
      const landingRoutes = [
        "/",
        "/features",
        "/pricing",
        "/privacy",
        "/terms",
      ];

      // If it's a landing route (root or landing page routes), redirect to www.onlnk.io
      // Only redirect if we're on onlnk.io (not www.onlnk.io) to avoid loops
      if (landingRoutes.includes(pathname) && host === "onlnk.io") {
        const landingUrl = `https://www.onlnk.io${pathname}${window.location.search}`;
        window.location.replace(landingUrl);
        return;
      }

      // For profiles and other routes, let vercel.json rewrites handle it
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
