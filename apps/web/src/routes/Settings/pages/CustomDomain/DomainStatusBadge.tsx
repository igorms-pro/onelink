import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock } from "lucide-react";

interface DomainStatusBadgeProps {
  verified: boolean;
}

export function DomainStatusBadge({ verified }: DomainStatusBadgeProps) {
  const { t } = useTranslation();

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        {t("settings_domain_status_verified")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      <Clock className="w-3 h-3" />
      {t("settings_domain_status_pending")}
    </span>
  );
}
