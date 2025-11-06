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
    iconBg: "bg-linear-to-br from-purple-500 to-purple-600",
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
    iconBg: "bg-linear-to-br from-purple-500 to-indigo-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "Link Click: Portfolio",
    description: "Your link was viewed 25 times today.",
    timestamp: "2h ago",
  },
  {
    id: "fake-3",
    icon: Upload,
    gradient: "from-purple-500 to-pink-500",
    bgGradient:
      "from-white via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-pink-950/20",
    iconBg: "bg-linear-to-br from-purple-500 to-purple-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "New Document Upload",
    description: "Resume submitted to your 'Careers' drop.",
    timestamp: "3h ago",
  },
  {
    id: "fake-4",
    icon: TrendingUp,
    gradient: "from-purple-500 to-indigo-500",
    bgGradient:
      "from-white via-purple-50/50 to-indigo-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/20",
    iconBg: "bg-linear-to-br from-purple-500 to-indigo-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "Analytics Update",
    description: "Your profile was viewed 50 times this week.",
    timestamp: "5h ago",
  },
  {
    id: "fake-5",
    icon: Upload,
    gradient: "from-purple-500 to-pink-500",
    bgGradient:
      "from-white via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-pink-950/20",
    iconBg: "bg-linear-to-br from-purple-500 to-purple-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "Image Upload Complete",
    description: "3 images submitted to your 'Gallery' link.",
    timestamp: "1d ago",
  },
  {
    id: "fake-6",
    icon: TrendingUp,
    gradient: "from-purple-500 to-indigo-500",
    bgGradient:
      "from-white via-purple-50/50 to-indigo-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/20",
    iconBg: "bg-linear-to-br from-purple-500 to-indigo-600",
    shadow: "shadow-purple-100/50 dark:shadow-purple-900/20",
    title: "Engagement Report",
    description: "Your links received 120 total clicks.",
    timestamp: "2d ago",
  },
];

export function InboxTab({ submissions }: InboxTabProps) {
  const { t } = useTranslation();

  const isNew = (timestamp: string) => {
    const itemDate = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  return (
    <section>
      <ul className="grid gap-3">
        {/* Fake notifications */}
        {fakeNotifications.map((notif) => {
          const Icon = notif.icon;
          // Fake items are always "new" for demo
          const showNew = true;
          return (
            <li
              key={notif.id}
              className="group relative rounded-xl bg-gray-50 dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl ${notif.iconBg} flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {notif.title}
                    </p>
                    {showNew && (
                      <span className="rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notif.description}
                  </p>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>
            </li>
          );
        })}

        {/* Real submissions */}
        {submissions.map((s) => {
          const showNew = isNew(s.created_at);
          return (
            <li
              key={s.submission_id}
              className="group relative rounded-xl bg-gray-50 dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {s.drop_label ?? t("dashboard_inbox_drop")}
                    </p>
                    {showNew && (
                      <span className="rounded-full bg-linear-to-r from-purple-600 to-purple-700 text-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
