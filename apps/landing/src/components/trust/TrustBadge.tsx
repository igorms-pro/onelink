import { Shield, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TrustBadge() {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="sticky top-8 rounded-3xl bg-white dark:bg-gray-900 p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
        <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
          <Shield className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 text-foreground">
          {t("landing.trust.gdprTitle")}
        </h3>
        <p className="text-base md:text-lg text-center text-muted-foreground mb-6">
          {t("landing.trust.gdprDescription")}
        </p>
        <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm md:text-base font-medium">
            {t("landing.trust.certified")}
          </span>
        </div>
      </div>
    </div>
  );
}
