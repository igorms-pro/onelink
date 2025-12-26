import { useTranslation } from "react-i18next";

export function FooterCopyright() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <p className="text-center text-sm text-gray-400">
        {t("footer_all_rights", { year: currentYear })}
      </p>
    </div>
  );
}
