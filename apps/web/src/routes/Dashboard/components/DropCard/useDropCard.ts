import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  toggleDropVisibility,
  getDropShareLink,
  getDropFiles,
} from "@/lib/drops";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import type { DropRow } from "../../types";
import type { DropFile } from "../DropFileList";
import { useAuth } from "@/lib/AuthProvider";
import { trackDropUpdated, trackDropDeleted } from "@/lib/posthog-events";

interface UseDropCardProps {
  drop: DropRow;
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}

export function useDropCard({
  drop: d,
  profileId,
  drops,
  setDrops,
}: UseDropCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileCount, setFileCount] = useState<number | null>(null);

  const shareLink = getDropShareLink(d.id, d.share_token);

  const handleEdit = useCallback(async () => {
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
    // Track drop update
    if (user?.id) {
      trackDropUpdated(user.id, d.id);
    }
  }, [d.id, d.label, profileId, drops, setDrops, t, user?.id]);

  const handleToggle = useCallback(
    async (checked: boolean) => {
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
    },
    [d.id, profileId, drops, setDrops, t],
  );

  const handleDelete = useCallback(async () => {
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
    // Track drop deletion
    if (user?.id) {
      trackDropDeleted(user.id, d.id);
    }
  }, [d.id, profileId, drops, setDrops, t, user?.id]);

  const handleToggleVisibility = useCallback(async () => {
    const newVisibility = !d.is_public;
    const success = await toggleDropVisibility(d.id, newVisibility);
    if (success) {
      setDrops(
        drops.map((x) =>
          x.id === d.id ? { ...x, is_public: newVisibility } : x,
        ),
      );
    }
  }, [d.id, d.is_public, drops, setDrops]);

  const handleShare = useCallback(() => {
    if (!shareLink) {
      toast.error(t("dashboard_content_drops_no_share_token"));
      return;
    }
    setIsShareModalOpen(true);
  }, [shareLink, t]);

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const dropFiles = await getDropFiles(d.id);
      setFiles(dropFiles);
    } catch {
      toast.error(t("dashboard_content_drops_files_load_failed"));
    } finally {
      setIsLoadingFiles(false);
    }
  }, [d.id, t]);

  const { execute: executeCount } = useAsyncOperation();

  // Load file count on mount
  useEffect(() => {
    executeCount(async () => {
      try {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("drop_id", d.id);
        setFileCount(count ?? 0);
      } catch {
        // Silently fail - count will show as "..."
      }
    });
  }, [d.id, executeCount]);

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

  const handleUploadComplete = useCallback(() => {
    if (showFiles) {
      loadFiles();
    }
  }, [showFiles, loadFiles]);

  const handleToggleFiles = useCallback(() => {
    setShowFiles(!showFiles);
    if (!showFiles && files.length === 0) {
      loadFiles();
    }
  }, [showFiles, files.length, loadFiles]);

  return {
    shareLink,
    isShareModalOpen,
    setIsShareModalOpen,
    showUpload,
    setShowUpload,
    showFiles,
    files,
    fileCount,
    isLoadingFiles,
    handleEdit,
    handleToggle,
    handleDelete,
    handleToggleVisibility,
    handleShare,
    handleUploadComplete,
    handleToggleFiles,
  };
}
