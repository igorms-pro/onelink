import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DropRow } from "../types";
import { useAuth } from "@/lib/AuthProvider";
import { trackDropCreated } from "@/lib/posthog-events";

interface DropFormProps {
  profileId: string | null;
  onDropCreated: (drop: DropRow) => void;
  isFree: boolean;
  freeDropsLimit: number;
  dropsCount: number;
}

export function DropForm({
  profileId,
  onDropCreated,
  isFree,
  freeDropsLimit,
  dropsCount,
}: DropFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const limitReached = isFree && dropsCount >= freeDropsLimit;

  return (
    <form
      className={`grid gap-2 sm:grid-cols-[1fr_auto] rounded-lg border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4 mb-4 ${limitReached ? "opacity-50 pointer-events-none" : ""}`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!profileId) return;
        if (isFree && dropsCount >= freeDropsLimit) {
          toast.error(
            t("dashboard_content_drops_limit_reached", {
              limit: freeDropsLimit,
            }),
          );
          return;
        }
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        const label = String(fd.get("label") || "").trim();
        if (!label) {
          toast.error(t("common_label_required"));
          return;
        }
        setBusy(true);
        try {
          const { data, error } = await supabase
            .from("drops")
            .insert([
              {
                profile_id: profileId,
                label,
                emoji: null,
                order: 1, // Order will be recalculated by parent
                is_public: true, // Default to public
              },
            ])
            .select("id,label,emoji,order,is_active,is_public,share_token")
            .single();
          if (error) throw error;
          onDropCreated(data as DropRow);
          form.reset();
          toast.success(t("dashboard_content_drops_create_success"));
          // Track drop creation
          if (user?.id) {
            trackDropCreated(user.id, data.id);
          }
        } catch {
          toast.error(t("dashboard_content_drops_create_failed"));
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        name="label"
        placeholder={t("dashboard_content_drops_label_placeholder")}
        disabled={limitReached}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
      />
      <button
        type="submit"
        disabled={busy || limitReached}
        className="rounded-md bg-linear-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm opacity-100 cursor-pointer"
      >
        {t("dashboard_content_drops_add_button")}
      </button>
      {limitReached && (
        <p className="mt-2 sm:mt-4 sm:col-span-2 text-sm text-red-600 dark:text-red-400 font-medium">
          {t("dashboard_content_drops_limit_reached_upgrade")}
        </p>
      )}
    </form>
  );
}
