import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

interface ProfileLinkCardProps {
  slug: string | null;
}

export function ProfileLinkCard({ slug }: ProfileLinkCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return null;
  }

  const profileUrl = `${window.location.origin}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success(t("dashboard_account_profile_link_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("dashboard_account_profile_link_copy_failed"));
    }
  };

  const handlePreview = () => {
    window.open(profileUrl, "_blank", "noopener,noreferrer");
  };

  const handleQRCode = () => {
    // TODO: Implement QR code modal/page
    toast.info(t("dashboard_account_profile_qr_coming_soon"));
  };

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {t("dashboard_account_profile_link_title")}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t("dashboard_account_profile_link_description")}
      </p>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-4">
        <input
          type="text"
          readOnly
          value={profileUrl}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white border-none outline-none"
        />
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={t("dashboard_account_profile_link_copy")}
        >
          <Copy
            className={`w-4 h-4 ${copied ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          <Copy className="w-4 h-4" />
          {t("dashboard_account_profile_link_copy")}
        </button>
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {t("dashboard_account_profile_link_preview")}
        </button>
        <button
          onClick={handleQRCode}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          {t("dashboard_account_profile_link_qr")}
        </button>
      </div>
    </section>
  );
}
