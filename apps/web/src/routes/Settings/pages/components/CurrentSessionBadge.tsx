import { useTranslation } from "react-i18next";

export function CurrentSessionBadge() {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1">
      {t("sessions_current_session")}
    </span>
  );
}
