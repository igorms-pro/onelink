import { useTranslation } from "react-i18next";
import { FileText, ExternalLink } from "lucide-react";
import type { Invoice } from "@/lib/billing";

interface InvoicesListProps {
  invoices: Invoice[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const { t } = useTranslation();

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "open":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "void":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  if (invoices.length === 0) {
    return (
      <div
        className="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
        data-testid="invoices-empty-state"
      >
        {t("billing_no_invoices", { defaultValue: "No invoices yet" })}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="invoices-list">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          data-testid={`invoice-${invoice.id}`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatAmount(invoice.amount, invoice.currency)}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    invoice.status,
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(invoice.created)}
              </p>
            </div>
          </div>
          {(invoice.invoicePdf || invoice.hostedInvoiceUrl) && (
            <a
              href={invoice.hostedInvoiceUrl || invoice.invoicePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              aria-label={t("billing_view_invoice", {
                defaultValue: "View invoice",
              })}
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
