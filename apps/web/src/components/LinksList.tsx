import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

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
  const { t } = useTranslation();
  const dragIndex = useRef<number | null>(null);
  const overIndex = useRef<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuRef = menuRefs.current[openMenuId];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 h-5">
        {savingOrder && (
          <span>{t("dashboard_content_links_saving_order")}</span>
        )}
      </div>
      {links.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("dashboard_content_links_empty")}
          </p>
        </div>
      ) : (
        <ul className="mt-2 grid gap-2">
          {links.map((l, idx) => (
            <li
              key={l.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow cursor-move group"
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
              <div className="min-w-0 flex-1 cursor-move pr-4">
                <p className="font-medium truncate text-gray-900 dark:text-white">
                  {l.emoji ? `${l.emoji} ` : ""}
                  {l.label}
                </p>
                <a
                  className="text-sm text-blue-600 dark:text-blue-300 hover:underline break-all block mt-2"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.url}
                </a>
              </div>
              <div
                className="relative flex-shrink-0"
                ref={(el) => {
                  menuRefs.current[l.id] = el;
                }}
              >
                <button
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === l.id ? null : l.id);
                  }}
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === l.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
                    <button
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        const newLabel = prompt(t("common_new_label"), l.label);
                        if (!newLabel) return;
                        const { error } = await supabase
                          .from("links")
                          .update({ label: newLabel })
                          .eq("id", l.id)
                          .eq("profile_id", profileId);
                        if (error) {
                          toast.error(t("common_update_failed"));
                          return;
                        }
                        setLinks(
                          links.map((x) =>
                            x.id === l.id ? { ...x, label: newLabel } : x,
                          ),
                        );
                        toast.success(
                          t("dashboard_content_links_update_success"),
                        );
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-sm">{t("common_edit")}</span>
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-600 dark:text-red-300"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        if (
                          !confirm(t("dashboard_content_links_delete_confirm"))
                        )
                          return;
                        const { error } = await supabase
                          .from("links")
                          .delete()
                          .eq("id", l.id)
                          .eq("profile_id", profileId);
                        if (error) {
                          toast.error(t("common_delete_failed"));
                          return;
                        }
                        setLinks(links.filter((x) => x.id !== l.id));
                        toast.success(
                          t("dashboard_content_links_delete_success"),
                        );
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">{t("common_delete")}</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
