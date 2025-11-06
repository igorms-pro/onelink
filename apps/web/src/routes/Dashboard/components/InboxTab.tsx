import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Upload, TrendingUp } from "lucide-react";
import type { SubmissionRow } from "../types";

interface InboxTabProps {
  submissions: SubmissionRow[];
}

// Fake notification items
const fakeNotifications = [
  {
    id: "fake-1",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "New File Upload:...",
    description: "Submitted to your 'Project Briefs' link.",
    timestamp: "5m ago",
  },
  {
    id: "fake-2",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Link Click: Portfolio",
    description: "Your link was viewed 25 times today.",
    timestamp: "2h ago",
  },
  {
    id: "fake-3",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "New Document Upload",
    description: "Resume submitted to your 'Careers' drop.",
    timestamp: "3h ago",
  },
  {
    id: "fake-4",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Analytics Update",
    description: "Your profile was viewed 50 times this week.",
    timestamp: "5h ago",
  },
  {
    id: "fake-5",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Image Upload Complete",
    description: "3 images submitted to your 'Gallery' link.",
    timestamp: "1d ago",
  },
  {
    id: "fake-6",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Engagement Report",
    description: "Your links received 120 total clicks.",
    timestamp: "2d ago",
  },
];

export function InboxTab({ submissions }: InboxTabProps) {
  const { t } = useTranslation();

  return (
    <section>
      <ul className="grid gap-3">
        {/* Fake notifications */}
        {fakeNotifications.map((notif, idx) => {
          const Icon = notif.icon;
          // First two items show purple dot
          const showDot = idx < 2;
          return (
            <li
              key={notif.id}
              className="group relative rounded-xl bg-gray-50 dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg ${notif.iconBg} flex items-center justify-center relative`}
                >
                  <Icon className="w-4 h-4 text-white" />
                  {showDot && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-white dark:ring-gray-800"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {notif.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>
            </li>
          );
        })}

        {/* Real submissions */}
        {submissions.map((s) => {
          return (
            <li
              key={s.submission_id}
              className="group relative rounded-xl bg-gray-50 dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-900 dark:bg-gray-700 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {s.drop_label ?? t("dashboard_inbox_drop")}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
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
                  {Array.isArray(s.files) && s.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-3">
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
