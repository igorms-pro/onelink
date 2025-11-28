import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/lib/billing";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod | null;
}

export function PaymentMethodCard({ paymentMethod }: PaymentMethodCardProps) {
  const { t } = useTranslation();

  const getCardBrandIcon = (brand: string): string => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes("visa")) return "💳";
    if (brandLower.includes("mastercard")) return "💳";
    if (brandLower.includes("amex")) return "💳";
    if (brandLower.includes("discover")) return "💳";
    return "💳";
  };

  if (!paymentMethod) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t("billing_no_payment_method", {
          defaultValue: "No payment method on file",
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg" aria-hidden="true">
          {getCardBrandIcon(paymentMethod.card.brand)}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {paymentMethod.card.brand.charAt(0).toUpperCase() +
              paymentMethod.card.brand.slice(1)}{" "}
            •••• {paymentMethod.card.last4}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("billing_expires", { defaultValue: "Expires" })}{" "}
            {String(paymentMethod.card.expMonth).padStart(2, "0")}/
            {paymentMethod.card.expYear}
          </p>
        </div>
      </div>
    </div>
  );
}
