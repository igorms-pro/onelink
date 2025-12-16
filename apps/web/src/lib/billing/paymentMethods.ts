import { getSubscriptionData } from "./subscription";
import type { PaymentMethod } from "./types";

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const data = await getSubscriptionData();
  return data.paymentMethods;
}
