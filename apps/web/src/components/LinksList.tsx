import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../lib/AuthProvider";
import { trackLinkUpdated, trackLinkDeleted } from "../lib/posthog-events";

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
  const { user } = useAuth();
  const dragIndex = useRef<number | null>(null);
  const overIndex = useRef<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  return (
    <>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 h-5">
        {savingOrder && (
          <span>{t("dashboard_content_links_saving_order")}</span>
        )}
      </div>
      {links.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("dashboard_content_links_empty")}
          </p>
        </div>
      ) : (
        <ul className="mt-2 grid gap-4">
          {links.map((l, idx) => (
            <li
              key={l.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4 hover:shadow-md transition-all cursor-move group"
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
                  className="text-sm text-blue-600 dark:text-blue-300 hover:underline break-all block mt-2 cursor-pointer"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.url}
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
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
                    toast.success(t("dashboard_content_links_update_success"));
                    // Track link update
                    if (user?.id) {
                      trackLinkUpdated(user.id, l.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  aria-label={t("common_edit")}
                >
                  <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(t("dashboard_content_links_delete_confirm")))
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
                    toast.success(t("dashboard_content_links_delete_success"));
                    // Track link deletion
                    if (user?.id) {
                      trackLinkDeleted(user.id, l.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  aria-label={t("common_delete")}
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
