import { useTranslation } from "react-i18next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import type { LegalSectionContent } from "@/components/LegalPageLayout";

export default function Privacy() {
  const { t } = useTranslation();
  const sections = t("privacy.sections", {
    returnObjects: true,
  }) as LegalSectionContent[];

  return (
    <LegalPageLayout
      title={t("privacy.title")}
      description={t("privacy.description")}
      lastUpdated={t("privacy.last_updated")}
      sections={sections}
    />
  );
}
