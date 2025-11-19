import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareDropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareLink: string;
  dropLabel: string;
}

export function ShareDropModal({
  open,
  onOpenChange,
  shareLink,
  dropLabel,
}: ShareDropModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success(t("dashboard_content_drops_link_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("dashboard_content_drops_link_copy_failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("dashboard_content_drops_share_title", { label: dropLabel })}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG value={shareLink} size={200} />
          </div>

          {/* Share Link */}
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t("dashboard_content_drops_share_link_label")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label={t("common_copy")}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {t("dashboard_content_drops_share_description")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
