import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import type { SubmissionRow } from "../types";

interface InboxTabProps {
  submissions: SubmissionRow[];
}

export function InboxTab({ submissions }: InboxTabProps) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("dashboard_inbox_title")}
        </h2>
        <span className="rounded-full border border-purple-200/80 dark:border-purple-700/80 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 backdrop-blur-sm text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-medium uppercase tracking-wide shadow-sm">
          {submissions.length}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t("dashboard_inbox_description")}
      </p>
      {submissions.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("dashboard_inbox_empty")}
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {submissions.map((s) => (
            <li
              key={s.submission_id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate text-gray-900 dark:text-white">
                    {s.drop_label ?? t("dashboard_inbox_drop")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                  <div className="mt-2 grid gap-1 text-sm">
                    {s.name && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard_inbox_name")}{" "}
                        </span>
                        {s.name}
                      </p>
                    )}
                    {s.email && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard_inbox_email")}{" "}
                        </span>
                        {s.email}
                      </p>
                    )}
                    {s.note && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard_inbox_note")}{" "}
                        </span>
                        {s.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {Array.isArray(s.files) && s.files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t("dashboard_inbox_files")} ({s.files.length})
                  </p>
                  <ul className="grid gap-2">
                    {s.files.map((f, idx) => {
                      const pub = supabase.storage
                        .from("drops")
                        .getPublicUrl(f.path);
                      const href = pub.data.publicUrl;
                      const name = f.path.split("/").pop();
                      return (
                        <li key={`${s.submission_id}-${idx}`}>
                          <a
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-300 hover:underline break-all text-sm font-medium"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="truncate">{name}</span>
                            {f.size && (
                              <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                ({Math.round(f.size / 1024)} KB)
                              </span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
