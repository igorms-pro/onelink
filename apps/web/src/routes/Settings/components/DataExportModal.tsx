import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DataExportForm,
  DataExportProgress,
  DataExportReadyState,
  DataExportActions,
} from "./DataExport";

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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selectedData, setSelectedData] = useState<Set<ExportDataType>>(
    new Set(["profile", "links", "drops", "submissions", "analytics"]),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleToggleDataType = (type: ExportDataType) => {
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
        <DataExportForm
          format={format}
          onFormatChange={setFormat}
          selectedData={selectedData}
          onToggleDataType={handleToggleDataType}
        />

        {isGenerating && <DataExportProgress progress={progress} />}

        {isReady && downloadUrl && <DataExportReadyState />}
      </div>

      <DataExportActions
        isGenerating={isGenerating}
        isReady={isReady}
        hasSelectedData={selectedData.size > 0}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
        onClose={handleClose}
      />
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
