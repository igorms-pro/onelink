import { useTranslation } from "react-i18next";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function useFormatRelativeTime() {
  const { t } = useTranslation();

  return (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("sessions_just_now");
    if (diffMins < 60) {
      return diffMins === 1
        ? t("sessions_minutes_ago", { count: diffMins })
        : t("sessions_minutes_ago_plural", { count: diffMins });
    }
    if (diffHours < 24) {
      return diffHours === 1
        ? t("sessions_hours_ago", { count: diffHours })
        : t("sessions_hours_ago_plural", { count: diffHours });
    }
    return diffDays === 1
      ? t("sessions_days_ago", { count: diffDays })
      : t("sessions_days_ago_plural", { count: diffDays });
  };
}
