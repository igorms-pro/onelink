import { useTranslation } from "react-i18next";
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
      <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("dashboard_content_drops_empty")}
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid gap-2">
      {drops.map((d) => (
        <li
          key={d.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-gray-900 dark:text-white">
              {d.emoji ? `${d.emoji} ` : ""}
              {d.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("dashboard_content_drops_order_status", {
                order: d.order,
                status: d.is_active ? t("common_active") : t("common_off"),
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onClick={async () => {
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
                setDrops(
                  drops.map((x) =>
                    x.id === d.id ? { ...x, label: newLabel } : x,
                  ),
                );
                toast.success(t("dashboard_content_drops_update_success"));
              }}
            >
              {t("common_edit")}
            </button>
            <button
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onClick={async () => {
                const { data, error } = await supabase
                  .from("drops")
                  .update({ is_active: !d.is_active })
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
                          is_active: data?.is_active ?? !d.is_active,
                        }
                      : x,
                  ),
                );
                toast.success(
                  data?.is_active
                    ? t("dashboard_content_drops_activated")
                    : t("dashboard_content_drops_deactivated"),
                );
              }}
            >
              {d.is_active
                ? t("dashboard_content_drops_turn_off")
                : t("dashboard_content_drops_turn_on")}
            </button>
            <button
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-red-600 dark:text-red-300 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={async () => {
                if (!confirm(t("dashboard_content_drops_delete_confirm")))
                  return;
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
              }}
            >
              {t("common_delete")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
