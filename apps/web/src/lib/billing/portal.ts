import { supabase } from "../supabase";
import { BillingError } from "./errors";
import { handleError } from "./httpUtils";

export async function goToPortal(): Promise<void> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const email = (await supabase.auth.getUser()).data.user?.email;

  if (!token) {
    throw new BillingError("Authentication required", "AUTH_REQUIRED");
  }

  if (!email) {
    throw new BillingError("User email not found", "NO_EMAIL");
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new BillingError(
        errorText || `HTTP ${res.status}: ${res.statusText}`,
        `HTTP_${res.status}`,
      );
    }

    const data = await res.json();

    if (!data?.url) {
      throw new BillingError("No portal URL received from server", "NO_URL");
    }

    window.open(data.url, "_blank");
  } catch (error) {
    handleError(error);
  }
}
