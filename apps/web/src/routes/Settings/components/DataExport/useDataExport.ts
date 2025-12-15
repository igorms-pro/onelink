import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import { supabase } from "@/lib/supabase";

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
      _format: ExportFormat,
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

      // Call Supabase Edge Function to generate export and return signed URL
      const { data, error } = await supabase.functions.invoke<{
        url: string;
        expires_in: number;
        audit_id?: string;
      }>("export-user-data", {
        method: "POST",
      });

      if (error || !data?.url) {
        console.error("Export generation failed (edge function):", error);
        throw new Error("Failed to generate export");
      }

      setDownloadUrl(data.url);
      setProgress(100);

      return data.url;
    },
    [user?.id, t],
  );

  const handleGenerate = useCallback(
    async (format: ExportFormat, dataTypes: Set<ExportDataType>) => {
      await submit(async () => {
        try {
          await generateExport(format, dataTypes);
          toast.success(t("settings_export_generation_success"));
        } catch (error) {
          console.error("Export generation failed:", error);
          toast.error(t("settings_export_generation_failed"));
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
