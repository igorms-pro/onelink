import { useTranslation } from "react-i18next";
import { Globe, Lock } from "lucide-react";

interface DropVisibilityBadgeProps {
  isPublic: boolean;
}

export function DropVisibilityBadge({ isPublic }: DropVisibilityBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
        isPublic
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
      }`}
    >
      {isPublic ? (
        <>
          <Globe className="w-3 h-3" />
          {t("dashboard_content_drops_public")}
        </>
      ) : (
        <>
          <Lock className="w-3 h-3" />
          {t("dashboard_content_drops_private")}
        </>
      )}
    </span>
  );
}
