import { useTranslation } from "react-i18next";

interface OnboardingButtonProps {
  isLastSlide: boolean;
  onClick: () => void;
}

export function OnboardingButton({
  isLastSlide,
  onClick,
}: OnboardingButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full pb-8">
      <button
        onClick={onClick}
        className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
      >
        {isLastSlide ? t("onboarding_getstarted_button") : t("onboarding_next")}
      </button>
    </div>
  );
}
