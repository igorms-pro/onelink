import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DropRow } from "../types";

interface DropListProps {
  profileId: string | null;
  drops: DropRow[];
  setDrops: React.Dispatch<React.SetStateAction<DropRow[]>>;
}

export function DropList({ profileId, drops, setDrops }: DropListProps) {
  if (drops.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No drops yet. Create your first drop above!
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid gap-2">
      {drops.map((d) => (
        <li
          key={d.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="min-w-0">
            <p className="font-medium truncate text-gray-900 dark:text-white">
              {d.emoji ? `${d.emoji} ` : ""}
              {d.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order {d.order} · {d.is_active ? "Active" : "Off"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onClick={async () => {
                const newLabel = prompt("New label", d.label);
                if (!newLabel) return;
                const { error } = await supabase
                  .from("drops")
                  .update({ label: newLabel })
                  .eq("id", d.id)
                  .eq("profile_id", profileId);
                if (error) {
                  toast.error("Update failed");
                  return;
                }
                setDrops(
                  drops.map((x) =>
                    x.id === d.id ? { ...x, label: newLabel } : x,
                  ),
                );
                toast.success("Drop updated");
              }}
            >
              Edit
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
                  toast.error("Toggle failed");
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
                  `Drop ${data?.is_active ? "activated" : "deactivated"}`,
                );
              }}
            >
              {d.is_active ? "Turn off" : "Turn on"}
            </button>
            <button
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={async () => {
                if (!confirm("Delete drop?")) return;
                const { error } = await supabase
                  .from("drops")
                  .delete()
                  .eq("id", d.id)
                  .eq("profile_id", profileId);
                if (error) {
                  toast.error("Delete failed");
                  return;
                }
                setDrops(drops.filter((x) => x.id !== d.id));
                toast.success("Drop deleted");
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
