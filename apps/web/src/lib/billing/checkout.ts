import { supabase } from "../supabase";
import { BillingError } from "./errors";
import { handleHttpError, handleError } from "./httpUtils";
import type { BillingPeriod, PlanTier } from "./types";
import { trackEvent } from "../posthog";

export async function goToCheckout(
  plan: PlanTier,
  period: BillingPeriod = "monthly",
): Promise<void> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  if (!token) {
    throw new BillingError("Authentication required", "AUTH_REQUIRED");
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-create-checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, period }),
      },
    );

    if (!res.ok) {
      await handleHttpError(res);
    }

    const data = await res.json();

    if (!data?.url) {
      throw new BillingError("No checkout URL received from server", "NO_URL");
    }

    // Track checkout started
    trackEvent("checkout_started", {
      plan,
      period,
    });

    window.location.href = data.url;
  } catch (error) {
    handleError(error);
  }
}
