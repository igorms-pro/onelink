import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface DataExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "json" | "csv";
type ExportDataType =
  | "profile"
  | "links"
  | "drops"
  | "submissions"
  | "analytics";

export function DataExportModal({ open, onOpenChange }: DataExportModalProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selectedData, setSelectedData] = useState<Set<ExportDataType>>(
    new Set(["profile", "links", "drops", "submissions", "analytics"]),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive modal
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleDataType = (type: ExportDataType) => {
    setSelectedData((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedData.size === 0) {
      toast.error(t("settings_export_no_data_selected"));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setIsReady(false);
    setDownloadUrl(null);

    try {
      // Simulate progress (will be replaced with actual API call)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/export', {
      //   method: 'POST',
      //   body: JSON.stringify({ format, dataTypes: Array.from(selectedData) })
      // });
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setProgress(100);

      // For now, create a mock download URL
      // In production, this will come from the API
      const mockData = {
        format,
        dataTypes: Array.from(selectedData),
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      const blob = new Blob([JSON.stringify(mockData, null, 2)], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setIsReady(true);
      toast.success(t("settings_export_generation_success"));
    } catch (error) {
      console.error("Export generation failed:", error);
      toast.error(t("settings_export_generation_failed"));
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `onemeet-export-${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("settings_export_download_started"));
  };

  const handleClose = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setIsReady(false);
    setDownloadUrl(null);
    setProgress(0);
    onOpenChange(false);
  };

  const content = (
    <>
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
                onChange={() => setFormat("json")}
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
                onChange={() => setFormat("csv")}
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
            {(
              [
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
              ] as { key: ExportDataType; label: string }[]
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedData.has(key)}
                  onChange={() => toggleDataType(key)}
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

        {/* Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                {t("settings_export_generating")}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Ready State */}
        {isReady && downloadUrl && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  {t("settings_export_ready")}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {t("settings_export_download_valid_24h")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {isReady ? t("common_close") : t("common_cancel")}
        </button>
        {isReady && downloadUrl ? (
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t("settings_export_download")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || selectedData.size === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("settings_export_generating")}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t("settings_export_generate")}
              </>
            )}
          </button>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{t("settings_data_export")}</DrawerTitle>
            <DrawerDescription>
              {t("settings_export_description")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("settings_data_export")}</DialogTitle>
          <DialogDescription>
            {t("settings_export_description")}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
