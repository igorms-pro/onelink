import { useTranslation } from "react-i18next";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";

interface OnboardingHeaderProps {
  onSkip: () => void;
}

export function OnboardingHeader({ onSkip }: OnboardingHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between p-4 md:p-6 lg:p-8">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-2">
          <img
            src="/logo.png"
            alt="OneLink"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Theme, Language toggles, and Skip button */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium bg-purple-600/90 hover:bg-purple-600 text-white transition-all rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            aria-label={t("onboarding_skip")}
          >
            {t("onboarding_skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
