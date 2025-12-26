import { useTranslation } from "react-i18next";

export interface ComparisonFeature {
  name: string;
  onelink: boolean | string;
  others: boolean | string;
}

export function useComparisonFeatures(): ComparisonFeature[] {
  const { t } = useTranslation();
  return [
    {
      name: t("landing.comparison.features.bioLinks"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.fileSharing"),
      onelink: true,
      others: false,
    },
    {
      name: t("landing.comparison.features.fileCollection"),
      onelink: true,
      others: false,
    },
    {
      name: t("landing.comparison.features.notifications"),
      onelink: true,
      others: "Limited",
    },
    {
      name: t("landing.comparison.features.analytics"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.customDomain"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.privacyControls"),
      onelink: true,
      others: "Limited",
    },
    {
      name: t("landing.comparison.features.theme"),
      onelink: true,
      others: true,
    },
  ];
}
