import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { OnboardingCarousel } from "../components/OnboardingCarousel";

export default function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
