import type { DropRow } from "../../types";
import { ShareDropModal } from "../ShareDropModal";
import { EditDropModal } from "../ContentTab/EditDropModal";
import { DeleteDropModal } from "../ContentTab/DeleteDropModal";
import { OwnerFileUpload } from "../OwnerFileUpload";
import { DropCardHeader } from "./DropCardHeader";
import { DropCardActions } from "./DropCardActions";
import { DropCardFiles } from "./DropCardFiles";
import { DropShareLinkInput } from "./DropShareLinkInput";
import { useDropCard } from "./useDropCard";

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
  const {
    shareLink,
    isShareModalOpen,
    setIsShareModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    showUpload,
    setShowUpload,
    showFiles,
    files,
    fileCount,
    isLoadingFiles,
    handleEdit,
    handleSaveEdit,
    handleToggle,
    handleDelete,
    handleDeleteConfirm,
    handleToggleVisibility,
    handleShare,
    handleUploadComplete,
    handleToggleFiles,
  } = useDropCard({ drop: d, profileId, drops, setDrops });

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

      <EditDropModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        drop={d}
        onSave={handleSaveEdit}
      />

      <DeleteDropModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        drop={d}
        onConfirm={handleDeleteConfirm}
      />
    </li>
  );
}
