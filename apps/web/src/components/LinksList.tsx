import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export type LinkRow = {
  id: string;
  label: string;
  emoji: string | null;
  url: string;
  order: number;
};

export function LinksList({
  profileId,
  links,
  setLinks,
}: {
  profileId: string | null;
  links: LinkRow[];
  setLinks: (rows: LinkRow[]) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const overIndex = useRef<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  return (
    <>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 h-5">
        {savingOrder && <span>Saving order…</span>}
      </div>
      {links.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No links yet. Create your first link above!
          </p>
        </div>
      ) : (
        <ul className="mt-2 grid gap-2">
          {links.map((l, idx) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow cursor-move group"
              draggable
              onDragStart={() => {
                dragIndex.current = idx;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                overIndex.current = idx;
              }}
              onDrop={async () => {
                const from = dragIndex.current;
                const to = overIndex.current;
                dragIndex.current = null;
                overIndex.current = null;
                if (from == null || to == null || from === to) return;
                const prev = links;
                const next = [...links];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                const reindexed = next.map((x, i) => ({ ...x, order: i + 1 }));
                setLinks(reindexed);
                setSavingOrder(true);
                try {
                  await Promise.all(
                    reindexed.map((row) =>
                      supabase
                        .from("links")
                        .update({ order: row.order })
                        .eq("id", row.id)
                        .eq("profile_id", profileId),
                    ),
                  );
                } catch (e) {
                  console.error(e);
                  setLinks(prev);
                  toast.error("Failed to save order");
                } finally {
                  setSavingOrder(false);
                }
              }}
            >
              <div className="min-w-0 flex-1 cursor-move">
                <p className="font-medium truncate text-gray-900 dark:text-white">
                  {l.emoji ? `${l.emoji} ` : ""}
                  {l.label}
                </p>
                <a
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.url}
                </a>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const newLabel = prompt("New label", l.label);
                    if (!newLabel) return;
                    const { error } = await supabase
                      .from("links")
                      .update({ label: newLabel })
                      .eq("id", l.id)
                      .eq("profile_id", profileId);
                    if (error) {
                      toast.error("Update failed");
                      return;
                    }
                    setLinks(
                      links.map((x) =>
                        x.id === l.id ? { ...x, label: newLabel } : x,
                      ),
                    );
                    toast.success("Link updated");
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Delete link?")) return;
                    const { error } = await supabase
                      .from("links")
                      .delete()
                      .eq("id", l.id)
                      .eq("profile_id", profileId);
                    if (error) {
                      toast.error("Delete failed");
                      return;
                    }
                    setLinks(links.filter((x) => x.id !== l.id));
                    toast.success("Link deleted");
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
