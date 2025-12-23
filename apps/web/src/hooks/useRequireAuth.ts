import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";

/**
 * Hook to redirect to /auth if user is not authenticated
 * @param redirectPath - Optional custom redirect path (default: "/auth")
 */
export function useRequireAuth(redirectPath = "/auth") {
  const navigate = useNavigate();
  const { user, loading, checkingMFA, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, user, navigate, redirectPath]);

  return { user, loading: loading || checkingMFA, signOut };
}
