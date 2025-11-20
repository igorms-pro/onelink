import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileLinkCardProps {
  slug: string | null;
  isFree: boolean;
}

export function ProfileLinkCard({ slug, isFree }: ProfileLinkCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

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
    if (isFree) {
      toast.info(t("dashboard_account_profile_qr_pro_feature"));
      navigate("/pricing");
      return;
    }
    setIsQRCodeOpen(true);
  };

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {t("dashboard_account_profile_link_title")}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t("dashboard_account_profile_link_description")}
      </p>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 mb-4">
        <input
          type="text"
          readOnly
          value={profileUrl}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white border-none outline-none"
        />
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors cursor-pointer"
          aria-label={t("dashboard_account_profile_link_copy")}
        >
          <Copy
            className={`w-4 h-4 ${copied ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"}`}
          />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          {isFree && (
            <div className="absolute right-1 -top-0.5 z-10">
              <span className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-purple-600 text-white rounded-full">
                Pro
              </span>
            </div>
          )}
          <button
            onClick={handleQRCode}
            disabled={isFree}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium transition-colors ${
              isFree
                ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            }`}
          >
            <QrCode className="w-4 h-4" />
            {t("dashboard_account_profile_link_qr")}
          </button>
        </div>
        <button
          onClick={handlePreview}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-1 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          {t("dashboard_account_profile_link_preview")}
        </button>
      </div>

      {/* QR Code Modal */}
      <Dialog open={isQRCodeOpen} onOpenChange={setIsQRCodeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard_account_profile_qr_title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={profileUrl} size={200} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t("dashboard_account_profile_qr_description")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
