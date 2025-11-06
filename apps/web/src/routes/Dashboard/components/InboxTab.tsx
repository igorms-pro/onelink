import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Upload, TrendingUp } from "lucide-react";
import type { SubmissionRow } from "../types";

interface InboxTabProps {
  submissions: SubmissionRow[];
}

// Fake notification items with subtle purple/white gradients
const fakeNotifications = [
  {
    id: "fake-1",
    icon: Upload,
    gradient: "from-purple-500 to-pink-500",
    bgGradient:
      "from-white via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-pink-950/20",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "New File Upload:...",
    description: "Submitted to your 'Project Briefs' link.",
    timestamp: "5m ago",
  },
  {
    id: "fake-2",
    icon: TrendingUp,
    gradient: "from-purple-500 to-indigo-500",
    bgGradient:
      "from-white via-purple-50/50 to-indigo-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/20",
    iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "Link Click: Portfolio",
    description: "Your link was viewed 25 times today.",
    timestamp: "2h ago",
  },
];

export function InboxTab({ submissions }: InboxTabProps) {
  const { t } = useTranslation();
  const totalCount = submissions.length + fakeNotifications.length;

  return (
    <section className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-purple-950/10 dark:to-pink-950/10 p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("dashboard_inbox_title")}
        </h2>
        <span className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm">
          {totalCount}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t("dashboard_inbox_description")}
      </p>
      <ul className="mt-4 grid gap-3">
        {/* Fake notifications */}
        {fakeNotifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <li
              key={notif.id}
              className={`group relative rounded-xl bg-gradient-to-br ${notif.bgGradient} p-4 hover:scale-[1.01] transition-all duration-200 ${notif.shadow} shadow-sm border border-gray-200/50 dark:border-gray-700/50`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl ${notif.iconBg} flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-200`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notif.description}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {/* Real submissions */}
        {submissions.map((s, idx) => {
          const gradients = [
            {
              bgGradient:
                "from-white via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-pink-950/20",
              iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
              shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
            },
            {
              bgGradient:
                "from-white via-purple-50/50 to-indigo-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/20",
              iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
              shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
            },
            {
              bgGradient:
                "from-white via-purple-50/50 to-violet-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-violet-950/20",
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
              shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
            },
          ];
          const style = gradients[idx % gradients.length];
          return (
            <li
              key={s.submission_id}
              className={`group relative rounded-xl bg-gradient-to-br ${style.bgGradient} p-4 hover:scale-[1.01] transition-all duration-200 ${style.shadow} shadow-sm border border-gray-200/50 dark:border-gray-700/50`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-200`}
                >
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
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
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {t("dashboard_inbox_files")} ({s.files.length})
                      </p>
                      <ul className="grid gap-2">
                        {s.files.map((f, fileIdx) => {
                          const pub = supabase.storage
                            .from("drops")
                            .getPublicUrl(f.path);
                          const href = pub.data.publicUrl;
                          const name = f.path.split("/").pop();
                          return (
                            <li key={`${s.submission_id}-${fileIdx}`}>
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
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
