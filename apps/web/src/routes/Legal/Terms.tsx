import { useTranslation } from "react-i18next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import type { LegalSectionContent } from "@/components/LegalPageLayout";

export default function Terms() {
  const { t } = useTranslation();
  const sections = t("terms.sections", {
    returnObjects: true,
  }) as LegalSectionContent[];

  return (
    <LegalPageLayout
      title={t("terms.title")}
      description={t("terms.description")}
      lastUpdated={t("terms.last_updated")}
      sections={sections}
    />
  );
}
