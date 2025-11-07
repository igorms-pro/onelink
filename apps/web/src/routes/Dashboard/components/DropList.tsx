import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DropRow } from "../types";

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

  return (
    <li className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4 sm:p-6 hover:shadow-md transition-all">
      {/* Left side: Title + Status (desktop: stacked, mobile: separate) */}
      <div className="min-w-0 flex-1">
        {/* Mobile: Title + Edit on same line */}
        {/* Desktop: Title only */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-0 mb-2 sm:mb-0">
          <p className="font-medium truncate text-gray-900 dark:text-white">
            {d.emoji ? `${d.emoji} ` : ""}
            {d.label}
          </p>
          {/* Edit Icon - Mobile: inline with title */}
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden shrink-0"
            aria-label={t("common_edit")}
          >
            <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        {/* Mobile: Status + Switch + Delete on same line */}
        {/* Desktop: Status only */}
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
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={t("common_delete")}
        >
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </li>
  );
}
