import { useTranslation } from "react-i18next";
import { Link2, Copy } from "lucide-react";
import { toast } from "sonner";

interface DropShareLinkInputProps {
  shareLink: string;
}

export function DropShareLinkInput({ shareLink }: DropShareLinkInputProps) {
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success(t("dashboard_content_drops_link_copied"));
    } catch {
      toast.error(t("dashboard_content_drops_link_copy_failed"));
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Link2 className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
      <input
        type="text"
        readOnly
        value={shareLink}
        className="flex-1 text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none truncate"
      />
      <button
        onClick={handleCopyLink}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label={t("dashboard_content_drops_copy_link")}
      >
        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}
