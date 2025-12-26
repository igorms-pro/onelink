import { useTranslation } from "react-i18next";

export function HeroHeadline() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 flex flex-col gap-8 order-1 lg:col-span-1">
      <div className="flex flex-col gap-2">
        <h1
          data-testid="hero-headline"
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
        >
          <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            {t("landing.hero.tagline")}
          </span>
        </h1>
        <p
          data-testid="hero-subtitle"
          className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium"
        >
          {t("landing.hero.headline")}
        </p>
      </div>
      <p
        data-testid="hero-description"
        className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed"
      >
        {t("landing.hero.description")}
      </p>
    </div>
  );
}
