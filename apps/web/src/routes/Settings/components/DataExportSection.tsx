import { useState } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataExportModal } from "./DataExportModal";

export function DataExportSection() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section
        data-testid="settings-data-export-section"
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("settings_data_export")}
          </h2>
        </div>
        <div className="space-y-3 pl-7">
          <button
            data-testid="settings-data-export-open"
            onClick={() => setIsModalOpen(true)}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_download_data")}
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("settings_export_description")}
          </div>
        </div>
      </section>
      <DataExportModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
