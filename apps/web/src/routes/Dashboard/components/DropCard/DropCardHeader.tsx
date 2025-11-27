import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DropVisibilityBadge } from "./DropVisibilityBadge";

interface DropCardHeaderProps {
  label: string;
  emoji: string | null;
  isActive: boolean;
  isPublic: boolean;
  onEdit: () => void;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

export function DropCardHeader({
  label,
  emoji,
  isActive,
  isPublic,
  onEdit,
  onToggle,
  onDelete,
}: DropCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      {/* Left side: Title + Badge */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-0 mb-2 sm:mb-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="font-medium truncate text-gray-900 dark:text-white">
              {emoji ? `${emoji} ` : ""}
              {label}
            </p>
            <DropVisibilityBadge isPublic={isPublic} />
          </div>
          {/* Edit Icon - Mobile */}
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden shrink-0 cursor-pointer"
            aria-label={t("common_edit")}
          >
            <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        {/* Switch + Delete - Mobile */}
        <div className="flex items-center justify-end gap-2 sm:hidden mt-2">
          <Switch
            checked={isActive}
            onCheckedChange={onToggle}
            aria-label={
              isActive
                ? t("dashboard_content_drops_turn_off")
                : t("dashboard_content_drops_turn_on")
            }
          />
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            aria-label={t("common_delete")}
          >
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Desktop: Edit + Switch + Delete */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label={t("common_edit")}
        >
          <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          aria-label={
            isActive
              ? t("dashboard_content_drops_turn_off")
              : t("dashboard_content_drops_turn_on")
          }
        />
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          aria-label={t("common_delete")}
        >
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}
