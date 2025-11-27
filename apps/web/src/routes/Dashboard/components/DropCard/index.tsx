import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  toggleDropVisibility,
  getDropShareLink,
  getDropFiles,
} from "@/lib/drops";
import type { DropRow } from "../../types";
import { ShareDropModal } from "../ShareDropModal";
import { OwnerFileUpload } from "../OwnerFileUpload";
import type { DropFile } from "../DropFileList";
import { DropCardHeader } from "./DropCardHeader";
import { DropCardActions } from "./DropCardActions";
import { DropCardFiles } from "./DropCardFiles";
import { DropShareLinkInput } from "./DropShareLinkInput";

interface DropCardProps {
  drop: DropRow;
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}

export function DropCard({
  drop: d,
  profileId,
  drops,
  setDrops,
}: DropCardProps) {
  const { t } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileCount, setFileCount] = useState<number | null>(null);

  const shareLink = getDropShareLink(d.id, d.share_token);

  const handleEdit = async () => {
    const newLabel = prompt(t("common_new_label"), d.label);
    if (!newLabel) return;
    const { error } = await supabase
      .from("drops")
      .update({ label: newLabel })
      .eq("id", d.id)
      .eq("profile_id", profileId);
    if (error) {
      toast.error(t("common_update_failed"));
      return;
    }
    setDrops(drops.map((x) => (x.id === d.id ? { ...x, label: newLabel } : x)));
    toast.success(t("dashboard_content_drops_update_success"));
  };

  const handleToggle = async (checked: boolean) => {
    const { data, error } = await supabase
      .from("drops")
      .update({ is_active: checked })
      .eq("id", d.id)
      .eq("profile_id", profileId)
      .select("is_active")
      .single<{ is_active: boolean }>();
    if (error) {
      toast.error(t("common_toggle_failed"));
      return;
    }
    setDrops(
      drops.map((x) =>
        x.id === d.id ? { ...x, is_active: data?.is_active ?? checked } : x,
      ),
    );
    toast.success(
      data?.is_active
        ? t("dashboard_content_drops_activated")
        : t("dashboard_content_drops_deactivated"),
    );
  };

  const handleDelete = async () => {
    if (!confirm(t("dashboard_content_drops_delete_confirm"))) return;
    const { error } = await supabase
      .from("drops")
      .delete()
      .eq("id", d.id)
      .eq("profile_id", profileId);
    if (error) {
      toast.error(t("common_delete_failed"));
      return;
    }
    setDrops(drops.filter((x) => x.id !== d.id));
    toast.success(t("dashboard_content_drops_delete_success"));
  };

  const handleToggleVisibility = async () => {
    const newVisibility = !d.is_public;
    const success = await toggleDropVisibility(d.id, newVisibility);
    if (success) {
      setDrops(
        drops.map((x) =>
          x.id === d.id ? { ...x, is_public: newVisibility } : x,
        ),
      );
    }
  };

  const handleShare = () => {
    if (!shareLink) {
      toast.error(t("dashboard_content_drops_no_share_token"));
      return;
    }
    setIsShareModalOpen(true);
  };

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const dropFiles = await getDropFiles(d.id);
      setFiles(dropFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error(t("dashboard_content_drops_files_load_failed"));
    } finally {
      setIsLoadingFiles(false);
    }
  }, [d.id, t]);

  // Load file count on mount
  useEffect(() => {
    let mounted = true;
    const loadFileCount = async () => {
      try {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("drop_id", d.id);
        if (mounted) {
          setFileCount(count ?? 0);
        }
      } catch {
        // Silently fail - count will show as "..."
      }
    };
    loadFileCount();
    return () => {
      mounted = false;
    };
  }, [d.id]);

  // Load files when showing files section
  useEffect(() => {
    if (showFiles && files.length === 0 && !isLoadingFiles) {
      loadFiles();
    }
  }, [showFiles, files.length, isLoadingFiles, loadFiles]);

  // Update file count when files are loaded
  useEffect(() => {
    if (files.length > 0) {
      setFileCount(files.length);
    }
  }, [files.length]);

  const handleUploadComplete = () => {
    if (showFiles) {
      loadFiles();
    }
  };

  const handleToggleFiles = () => {
    setShowFiles(!showFiles);
    if (!showFiles && files.length === 0) {
      loadFiles();
    }
  };

  return (
    <li
      className={`flex flex-col gap-3 sm:gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all ${d.is_active ? "bg-purple-50 dark:bg-purple-900/20" : "bg-gray-100 dark:bg-gray-800/50 opacity-60"}`}
    >
      <DropCardHeader
        label={d.label}
        emoji={d.emoji}
        isActive={d.is_active}
        isPublic={d.is_public ?? true}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {shareLink && <DropShareLinkInput shareLink={shareLink} />}

      <DropCardActions
        isPublic={d.is_public ?? true}
        shareLink={shareLink}
        showUpload={showUpload}
        onToggleVisibility={handleToggleVisibility}
        onShare={handleShare}
        onToggleUpload={() => setShowUpload(!showUpload)}
      />

      {showUpload && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <OwnerFileUpload
            dropId={d.id}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      <DropCardFiles
        files={files}
        fileCount={fileCount}
        showFiles={showFiles}
        isLoading={isLoadingFiles}
        onToggle={handleToggleFiles}
      />

      {shareLink && (
        <ShareDropModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          shareLink={shareLink}
          dropLabel={d.label}
        />
      )}
    </li>
  );
}
