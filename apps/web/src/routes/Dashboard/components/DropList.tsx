import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Pencil,
  Trash2,
  Globe,
  Lock,
  Link2,
  Upload,
  X,
  File,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  toggleDropVisibility,
  getDropShareLink,
  getDropFiles,
} from "@/lib/drops";
import type { DropRow } from "../types";
import { ShareDropModal } from "./ShareDropModal";
import { OwnerFileUpload } from "./OwnerFileUpload";

interface DropListProps {
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}

export function DropList({ profileId, drops, setDrops }: DropListProps) {
  const { t } = useTranslation();
  if (drops.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("dashboard_content_drops_empty")}
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid gap-4 pb-12">
      {drops.map((d) => (
        <DropCard
          key={d.id}
          drop={d}
          profileId={profileId}
          drops={drops}
          setDrops={setDrops}
        />
      ))}
    </ul>
  );
}

function DropCard({
  drop: d,
  profileId,
  drops,
  setDrops,
}: {
  drop: DropRow;
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}) {
  const { t } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [files, setFiles] = useState<
    Array<{
      path: string;
      size: number;
      content_type: string | null;
      submission_id: string;
      created_at: string;
      uploaded_by: string | null;
    }>
  >([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

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
        x.id === d.id
          ? {
              ...x,
              is_active: data?.is_active ?? checked,
            }
          : x,
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

  const handleCopyLink = async () => {
    const shareLink = getDropShareLink(d.id, d.share_token);
    if (!shareLink) {
      toast.error(t("dashboard_content_drops_no_share_token"));
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success(t("dashboard_content_drops_link_copied"));
    } catch {
      toast.error(t("dashboard_content_drops_link_copy_failed"));
    }
  };

  const handleShare = () => {
    const shareLink = getDropShareLink(d.id, d.share_token);
    if (!shareLink) {
      toast.error(t("dashboard_content_drops_no_share_token"));
      return;
    }
    setIsShareModalOpen(true);
  };

  const shareLink = getDropShareLink(d.id, d.share_token);

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

  // Load files when showing files section
  useEffect(() => {
    if (showFiles && files.length === 0 && !isLoadingFiles) {
      loadFiles();
    }
  }, [showFiles, files.length, isLoadingFiles, loadFiles]);

  const handleUploadComplete = () => {
    // Reload files after upload
    if (showFiles) {
      loadFiles();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getFileUrl = (path: string): string => {
    const { data } = supabase.storage.from("drops").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <li className="flex flex-col gap-3 sm:gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4 sm:p-6 hover:shadow-md transition-all">
      {/* Top section: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Left side: Title + Badge + Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-0 mb-2 sm:mb-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="font-medium truncate text-gray-900 dark:text-white">
                {d.emoji ? `${d.emoji} ` : ""}
                {d.label}
              </p>
              {/* Visibility Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  d.is_public
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                }`}
              >
                {d.is_public ? (
                  <>
                    <Globe className="w-3 h-3" />
                    {t("dashboard_content_drops_public")}
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    {t("dashboard_content_drops_private")}
                  </>
                )}
              </span>
            </div>
            {/* Edit Icon - Mobile: inline with title */}
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden shrink-0 cursor-pointer"
              aria-label={t("common_edit")}
            >
              <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          {/* Status */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
              {t("dashboard_content_drops_order_status", {
                order: d.order,
                status: d.is_active ? t("common_active") : t("common_off"),
              })}
            </p>
            {/* Switch + Delete - Mobile: inline with status */}
            <div className="flex items-center gap-2 sm:hidden shrink-0">
              <Switch
                checked={d.is_active}
                onCheckedChange={handleToggle}
                aria-label={
                  d.is_active
                    ? t("dashboard_content_drops_turn_off")
                    : t("dashboard_content_drops_turn_on")
                }
              />
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                aria-label={t("common_delete")}
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Edit + Switch + Delete aligned to right */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label={t("common_edit")}
          >
            <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Switch
            checked={d.is_active}
            onCheckedChange={handleToggle}
            aria-label={
              d.is_active
                ? t("dashboard_content_drops_turn_off")
                : t("dashboard_content_drops_turn_on")
            }
          />
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            aria-label={t("common_delete")}
          >
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Share Link Section */}
      {shareLink && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Link2 className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
          <input
            type="text"
            readOnly
            value={shareLink}
            className="flex-1 text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none truncate"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Visibility */}
        <button
          onClick={handleToggleVisibility}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
        >
          {d.is_public ? (
            <>
              <Lock className="w-4 h-4" />
              {t("dashboard_content_drops_make_private")}
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              {t("dashboard_content_drops_make_public")}
            </>
          )}
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          disabled={!shareLink}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="w-4 h-4" />
          {t("dashboard_content_drops_copy_link")}
        </button>

        {/* Share with QR */}
        <button
          onClick={handleShare}
          disabled={!shareLink}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="w-4 h-4" />
          {t("dashboard_content_drops_share")}
        </button>

        {/* Upload Files */}
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
        >
          {showUpload ? (
            <>
              <X className="w-4 h-4" />
              {t("common_hide")}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {t("dashboard_content_drops_upload_files")}
            </>
          )}
        </button>
      </div>

      {/* Owner File Upload Section */}
      {showUpload && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <OwnerFileUpload
            dropId={d.id}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* Files List Section */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setShowFiles(!showFiles);
            if (!showFiles && files.length === 0) {
              loadFiles();
            }
          }}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <File className="w-4 h-4" />
            <span>
              {t("dashboard_content_drops_files_list")} ({files.length})
            </span>
          </div>
          {showFiles ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {showFiles && (
          <div className="mt-3 space-y-2">
            {isLoadingFiles ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t("common_loading")}
              </div>
            ) : files.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t("dashboard_content_drops_no_files")}
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={`${file.submission_id}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={getFileUrl(file.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline truncate block"
                      >
                        {file.path.split("/").pop()}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          •
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(file.created_at)}
                        </p>
                        {file.uploaded_by && (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              •
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("dashboard_content_drops_uploaded_by")}{" "}
                              {file.uploaded_by}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
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
