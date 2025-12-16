import { getSubscriptionData } from "./subscription";
import type { Invoice } from "./types";

export async function getInvoices(): Promise<Invoice[]> {
  const data = await getSubscriptionData();
  return data.invoices;
}
