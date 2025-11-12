import { useTranslation } from "react-i18next";

type ExportFormat = "json" | "csv";
type ExportDataType =
  | "profile"
  | "links"
  | "drops"
  | "submissions"
  | "analytics";

interface DataExportFormProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  selectedData: Set<ExportDataType>;
  onToggleDataType: (type: ExportDataType) => void;
}

export function DataExportForm({
  format,
  onFormatChange,
  selectedData,
  onToggleDataType,
}: DataExportFormProps) {
  const { t } = useTranslation();

  const dataTypes: { key: ExportDataType; label: string }[] = [
    { key: "profile", label: t("settings_export_data_profile") },
    { key: "links", label: t("settings_export_data_links") },
    { key: "drops", label: t("settings_export_data_drops") },
    {
      key: "submissions",
      label: t("settings_export_data_submissions"),
    },
    {
      key: "analytics",
      label: t("settings_export_data_analytics"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
          {t("settings_export_format")}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="json"
              checked={format === "json"}
              onChange={() => onFormatChange("json")}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              JSON
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === "csv"}
              onChange={() => onFormatChange("csv")}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              CSV
            </span>
          </label>
        </div>
      </div>

      {/* Data Selection */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
          {t("settings_export_data_to_include")}
        </label>
        <div className="space-y-2">
          {dataTypes.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedData.has(key)}
                onChange={() => onToggleDataType(key)}
                className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* GDPR Notice */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          {t("settings_export_gdpr_notice")}
        </p>
      </div>
    </div>
  );
}
