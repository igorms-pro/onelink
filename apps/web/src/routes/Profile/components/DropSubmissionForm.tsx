import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import type { PublicDrop } from "../types";

interface DropSubmissionFormProps {
  drop: PublicDrop;
}

export function DropSubmissionForm({ drop }: DropSubmissionFormProps) {
  const { t } = useTranslation();
  return (
    <form
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const name = (formData.get("name") as string) || null;
        const email = (formData.get("email") as string) || null;
        const note = (formData.get("note") as string) || null;
        const filesInput = form.querySelector(
          'input[name="files"]',
        ) as HTMLInputElement | null;
        const files = filesInput?.files ? Array.from(filesInput.files) : [];
        const maxSizeMB = drop.max_file_size_mb ?? 50;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // Client-side validation
        for (const f of files) {
          if (f.size > maxSizeBytes) {
            alert(
              t("profile_drop_submission_file_too_large", {
                name: f.name,
                limit: maxSizeMB,
              }),
            );
            return;
          }
          const ext = f.name.split(".").pop()?.toLowerCase() || "";
          const blocked = [
            "exe",
            "bat",
            "cmd",
            "com",
            "pif",
            "scr",
            "vbs",
            "js",
            "jar",
            "app",
            "dmg",
          ];
          if (blocked.includes(ext)) {
            alert(t("profile_drop_submission_file_type_blocked", { ext }));
            return;
          }
        }

        try {
          // Upload files to Supabase Storage
          const uploaded: {
            path: string;
            size: number;
            content_type: string | null;
          }[] = [];
          for (const f of files) {
            const ext = f.name.split(".").pop() || "bin";
            const key = `${drop.drop_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await supabase.storage
              .from("drops")
              .upload(key, f, {
                contentType: f.type || undefined,
                upsert: false,
              });
            if (upErr) throw upErr;
            uploaded.push({
              path: key,
              size: f.size,
              content_type: f.type || null,
            });
          }

          // Create submission row
          const { error } = await supabase.from("submissions").insert([
            {
              drop_id: drop.drop_id,
              name,
              email,
              note,
              files: uploaded,
              user_agent: navigator.userAgent,
            },
          ]);
          if (error) throw error;
          alert(t("profile_drop_submission_success"));
          form.reset();
        } catch (err) {
          console.error(err);
          alert(t("profile_drop_submission_failed"));
        }
      }}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {drop.emoji ? `${drop.emoji} ` : ""}
        {drop.label}
      </h2>
      <div className="grid gap-3">
        <input
          name="name"
          placeholder={t("profile_drop_submission_name_placeholder")}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
        />
        <input
          name="email"
          type="email"
          placeholder={t("profile_drop_submission_email_placeholder")}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
        />
        <textarea
          name="note"
          placeholder={t("profile_drop_submission_note_placeholder")}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all resize-none min-h-[80px]"
        />
        <input
          name="files"
          type="file"
          multiple
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-300"
        />
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-sm opacity-100"
        >
          {t("profile_drop_submission_send")}
        </button>
      </div>
    </form>
  );
}
