import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface HeroCTAProps {
  onClick: () => void;
}

export function HeroCTA({ onClick }: HeroCTAProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center lg:justify-start order-4 lg:col-span-1">
      <Button
        data-testid="hero-cta-view-demo"
        size="lg"
        variant="outline"
        onClick={onClick}
        className="border-2 px-6 md:px-8 py-4 md:py-5 text-base md:text-lg"
      >
        <Play className="size-5 mr-2" />
        {t("landing.hero.ctaSecondary")}
      </Button>
    </div>
  );
}
