import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import { fetchUserData } from "./exportDataFetcher";
import { formatAsJSON, formatAsCSV } from "./exportFormatters";

export type ExportFormat = "json" | "csv";
export type ExportDataType =
  | "profile"
  | "links"
  | "drops"
  | "submissions"
  | "analytics";

export function useDataExport() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submitting, submit } = useAsyncSubmit();
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateExport = useCallback(
    async (
      format: ExportFormat,
      dataTypes: Set<ExportDataType>,
    ): Promise<string> => {
      if (dataTypes.size === 0) {
        throw new Error(t("settings_export_no_data_selected"));
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      setProgress(0);
      setDownloadUrl(null);

      const data = await fetchUserData(user.id, dataTypes, setProgress);

      let content: string;
      let mimeType: string;

      if (format === "json") {
        content = formatAsJSON(data);
        mimeType = "application/json";
      } else {
        content = formatAsCSV(data);
        mimeType = "text/csv";
      }

      // Create blob and download URL
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      return url;
    },
    [user?.id, t],
  );

  const handleGenerate = useCallback(
    async (format: ExportFormat, dataTypes: Set<ExportDataType>) => {
      await submit(async () => {
        try {
          await generateExport(format, dataTypes);
          toast.success(t("settings_export_generated"));
        } catch (error) {
          console.error("Export generation failed:", error);
          toast.error(t("settings_export_failed"));
          throw error;
        }
      });
    },
    [generateExport, submit, t],
  );

  const cleanup = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }, [downloadUrl]);

  return {
    submitting,
    progress,
    downloadUrl,
    handleGenerate,
    cleanup,
  };
}
