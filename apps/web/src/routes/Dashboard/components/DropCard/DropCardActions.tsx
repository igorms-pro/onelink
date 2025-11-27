import { useTranslation } from "react-i18next";
import { Globe, Lock, Link2, Upload, X, ExternalLink } from "lucide-react";

interface DropCardActionsProps {
  isPublic: boolean;
  shareLink: string | null;
  showUpload: boolean;
  onToggleVisibility: () => void;
  onShare: () => void;
  onToggleUpload: () => void;
}

export function DropCardActions({
  isPublic,
  shareLink,
  showUpload,
  onToggleVisibility,
  onShare,
  onToggleUpload,
}: DropCardActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onToggleVisibility}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {isPublic ? (
          <>
            <Lock className="w-4 h-4" />
            {t("dashboard_content_drops_make_private")}
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            {t("dashboard_content_drops_make_public")}
          </>
        )}
      </button>

      <a
        href={shareLink ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 cursor-pointer ${!shareLink ? "opacity-50 pointer-events-none" : ""}`}
      >
        <ExternalLink className="w-4 h-4" />
        {t("dashboard_content_drops_preview")}
      </a>

      <button
        onClick={onShare}
        disabled={!shareLink}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Link2 className="w-4 h-4" />
        {t("dashboard_content_drops_share")}
      </button>

      <button
        onClick={onToggleUpload}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {showUpload ? (
          <>
            <X className="w-4 h-4" />
            {t("common_hide")}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {t("dashboard_content_drops_upload_files")}
          </>
        )}
      </button>
    </div>
  );
}
