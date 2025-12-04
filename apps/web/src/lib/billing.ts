import { supabase } from "./supabase";

export class BillingError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

export type BillingPeriod = "monthly" | "yearly";
export type PlanTier = "starter" | "pro";

export interface SubscriptionDetails {
  renewalDate: string | null;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  created: number;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface SubscriptionData {
  subscription: SubscriptionDetails | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

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
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      let errorCode = `HTTP_${res.status}`;

      try {
        const errorData = await res.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.code) {
          errorCode = errorData.code;
        }
      } catch {
        // If not JSON, try text
        const errorText = await res.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new BillingError(errorMessage, errorCode);
    }

    const data = await res.json();

    if (!data?.url) {
      throw new BillingError("No checkout URL received from server", "NO_URL");
    }

    window.location.href = data.url;
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new BillingError(error.message, "NETWORK_ERROR");
    }
    throw new BillingError("An unexpected error occurred", "UNKNOWN");
  }
}

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
    if (error instanceof BillingError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new BillingError(error.message, "NETWORK_ERROR");
    }
    throw new BillingError("An unexpected error occurred", "UNKNOWN");
  }
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  if (!token) {
    throw new BillingError("Authentication required", "AUTH_REQUIRED");
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-get-subscription`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      let errorCode = `HTTP_${res.status}`;

      try {
        const errorData = await res.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.code) {
          errorCode = errorData.code;
        }
      } catch {
        const errorText = await res.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new BillingError(errorMessage, errorCode);
    }

    const data = await res.json();
    return data as SubscriptionData;
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new BillingError(error.message, "NETWORK_ERROR");
    }
    throw new BillingError("An unexpected error occurred", "UNKNOWN");
  }
}

export async function getSubscriptionDetails(): Promise<SubscriptionDetails | null> {
  const data = await getSubscriptionData();
  return data.subscription;
}

export async function getInvoices(): Promise<Invoice[]> {
  const data = await getSubscriptionData();
  return data.invoices;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const data = await getSubscriptionData();
  return data.paymentMethods;
}
