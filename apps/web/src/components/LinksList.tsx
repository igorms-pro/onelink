import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

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
  setLinks
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
      <div className="mt-2 text-sm text-gray-600 h-5">
        {savingOrder && <span>Saving order…</span>}
      </div>
      <ul className="mt-2 grid gap-3">
        {links.map((l, idx) => (
          <li
            key={l.id}
            className="flex items-center justify-between rounded border p-3"
            draggable
            onDragStart={() => { dragIndex.current = idx; }}
            onDragOver={(e) => { e.preventDefault(); overIndex.current = idx; }}
            onDrop={async () => {
              const from = dragIndex.current; const to = overIndex.current;
              dragIndex.current = null; overIndex.current = null;
              if (from == null || to == null || from === to) return;
              const prev = links;
              const next = [...links];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              const reindexed = next.map((x, i) => ({ ...x, order: i + 1 }));
              setLinks(reindexed);
              setSavingOrder(true);
              try {
                await Promise.all(reindexed.map((row) =>
                  supabase
                    .from("links")
                    .update({ order: row.order })
                    .eq("id", row.id)
                    .eq("profile_id", profileId)
                ));
              } catch (e) {
                console.error(e);
                setLinks(prev);
                alert("Failed to save order");
              } finally {
                setSavingOrder(false);
              }
            }}
          >
            <div className="min-w-0 cursor-move">
              <p className="font-medium truncate">{l.emoji ? `${l.emoji} ` : ""}{l.label}</p>
              <a className="text-sm text-blue-600 underline break-all" href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={async () => {
                  const newLabel = prompt("New label", l.label);
                  if (!newLabel) return;
                  const { error } = await supabase
                    .from("links")
                    .update({ label: newLabel })
                    .eq("id", l.id)
                    .eq("profile_id", profileId);
                  if (error) return alert("Update failed");
                  setLinks(links.map(x => x.id === l.id ? { ...x, label: newLabel } : x));
                }}
              >
                Edit
              </button>
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={async () => {
                  if (!confirm("Delete link?")) return;
                  const { error } = await supabase
                    .from("links")
                    .delete()
                    .eq("id", l.id)
                    .eq("profile_id", profileId);
                  if (error) return alert("Delete failed");
                  setLinks(links.filter(x => x.id !== l.id));
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}


