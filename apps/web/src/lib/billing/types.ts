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
