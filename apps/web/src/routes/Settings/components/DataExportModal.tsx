import { useState, useEffect } from "react";
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
import {
  useDataExport,
  type ExportFormat,
  type ExportDataType,
} from "./DataExport/useDataExport";

interface DataExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataExportModal({ open, onOpenChange }: DataExportModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selectedData, setSelectedData] = useState<Set<ExportDataType>>(
    new Set(["profile", "links", "drops", "submissions", "analytics"]),
  );
  const [isReady, setIsReady] = useState(false);

  const {
    submitting: isGenerating,
    progress,
    downloadUrl,
    handleGenerate,
    cleanup,
  } = useDataExport();

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

  const handleGenerateClick = async () => {
    setIsReady(false);
    await handleGenerate(format, selectedData);
    if (downloadUrl) {
      setIsReady(true);
    }
  };

  // Update isReady when downloadUrl changes
  useEffect(() => {
    if (downloadUrl && !isGenerating) {
      setIsReady(true);
    }
  }, [downloadUrl, isGenerating]);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      // Fetch the signed URL to get the file content
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to download export file");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `onelink-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      toast.success(t("settings_export_download_started"));
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        t("settings_export_download_failed") || "Failed to download export",
      );
    }
  };

  const handleClose = () => {
    cleanup();
    setIsReady(false);
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

        {isReady && downloadUrl && (
          <DataExportReadyState downloadUrl={downloadUrl} />
        )}
      </div>

      <DataExportActions
        isGenerating={isGenerating}
        isReady={isReady}
        hasSelectedData={selectedData.size > 0}
        onGenerate={handleGenerateClick}
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
