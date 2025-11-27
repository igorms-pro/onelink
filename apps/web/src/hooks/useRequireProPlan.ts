import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useDashboardData } from "@/routes/Dashboard/hooks/useDashboardData";
import { isProPlan } from "@/lib/types/plan";

/**
 * Hook to redirect if user doesn't have Pro plan
 * @param redirectPath - Optional custom redirect path (default: "/settings")
 */
export function useRequireProPlan(redirectPath = "/settings") {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useDashboardData(user?.id ?? null);

  useEffect(() => {
    if (!authLoading && !planLoading && !isProPlan(plan)) {
      navigate(redirectPath, { replace: true });
    }
  }, [authLoading, planLoading, plan, navigate, redirectPath]);

  return {
    user,
    plan,
    loading: authLoading || planLoading,
    isPro: isProPlan(plan),
  };
}
