import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DropRow } from "../types";

interface DropFormProps {
  profileId: string | null;
  onDropCreated: (drop: DropRow) => void;
  isFree: boolean;
  freeLimit: number;
  totalItems: number;
}

export function DropForm({
  profileId,
  onDropCreated,
  isFree,
  freeLimit,
  totalItems,
}: DropFormProps) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-4 grid gap-3 rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-linear-to-br from-gray-50/80 to-white/80 dark:from-gray-900/50 dark:to-gray-950/50 backdrop-blur-sm p-4 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!profileId) return;
        if (isFree && totalItems >= freeLimit) {
          toast.error(
            `Free plan limit reached (${freeLimit} actions). Remove one or upgrade.`,
          );
          return;
        }
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        const label = String(fd.get("label") || "").trim();
        const emoji = (String(fd.get("emoji") || "").trim() || null) as
          | string
          | null;
        if (!label) {
          toast.error("Label is required");
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
                emoji,
                order: 1, // Order will be recalculated by parent
              },
            ])
            .select("id,label,emoji,order,is_active")
            .single();
          if (error) throw error;
          onDropCreated(data as DropRow);
          form.reset();
          toast.success("Drop created successfully");
        } catch (e) {
          console.error(e);
          toast.error("Failed to create drop");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        <input
          name="label"
          placeholder="Label (e.g. Upload assets)"
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 col-span-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        <input
          name="emoji"
          placeholder="Emoji (optional)"
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={busy}
          className="rounded border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Drop
        </button>
      </div>
    </form>
  );
}
