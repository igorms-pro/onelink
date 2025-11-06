import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Upload, TrendingUp } from "lucide-react";
import type { SubmissionRow } from "../types";

interface InboxTabProps {
  submissions: SubmissionRow[];
}

// Fake notification items with modern gaming-inspired styling
const fakeNotifications = [
  {
    id: "fake-1",
    icon: Upload,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient:
      "from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30",
    iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
    shadow: "shadow-orange-200/50 dark:shadow-orange-900/20",
    title: "New File Upload:...",
    description: "Submitted to your 'Project Briefs' link.",
    timestamp: "5m ago",
  },
  {
    id: "fake-2",
    icon: TrendingUp,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    bgGradient:
      "from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30",
    iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    shadow: "shadow-blue-200/50 dark:shadow-blue-900/20",
    title: "Link Click: Portfolio",
    description: "Your link was viewed 25 times today.",
    timestamp: "2h ago",
  },
];

export function InboxTab({ submissions }: InboxTabProps) {
  const { t } = useTranslation();
  const totalCount = submissions.length + fakeNotifications.length;

  return (
    <section className="rounded-2xl border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-fuchsia-950/20 p-6 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t("dashboard_inbox_title")}
        </h2>
        <span className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-lg">
          {totalCount}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t("dashboard_inbox_description")}
      </p>
      <ul className="mt-4 grid gap-4">
        {/* Fake notifications */}
        {fakeNotifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <li
              key={notif.id}
              className={`group relative rounded-2xl bg-gradient-to-br ${notif.bgGradient} p-5 hover:scale-[1.02] transition-all duration-300 ${notif.shadow} shadow-lg border border-white/50 dark:border-white/10 overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${notif.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <div className="relative flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl ${notif.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">
                        {notif.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-full">
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
              gradient: "from-purple-500 via-pink-500 to-rose-500",
              bgGradient:
                "from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30",
              iconBg: "bg-gradient-to-br from-purple-400 to-pink-500",
              shadow: "shadow-purple-200/50 dark:shadow-purple-900/20",
            },
            {
              gradient: "from-indigo-500 via-purple-500 to-pink-500",
              bgGradient:
                "from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30",
              iconBg: "bg-gradient-to-br from-indigo-400 to-purple-500",
              shadow: "shadow-indigo-200/50 dark:shadow-indigo-900/20",
            },
            {
              gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
              bgGradient:
                "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30",
              iconBg: "bg-gradient-to-br from-violet-400 to-fuchsia-500",
              shadow: "shadow-violet-200/50 dark:shadow-violet-900/20",
            },
          ];
          const style = gradients[idx % gradients.length];
          return (
            <li
              key={s.submission_id}
              className={`group relative rounded-2xl bg-gradient-to-br ${style.bgGradient} p-5 hover:scale-[1.02] transition-all duration-300 ${style.shadow} shadow-lg border border-white/50 dark:border-white/10 overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <div className="relative flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {s.drop_label ?? t("dashboard_inbox_drop")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-full">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1.5 text-sm">
                    {s.name && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {t("dashboard_inbox_name")}{" "}
                        </span>
                        {s.name}
                      </p>
                    )}
                    {s.email && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {t("dashboard_inbox_email")}{" "}
                        </span>
                        {s.email}
                      </p>
                    )}
                    {s.note && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {t("dashboard_inbox_note")}{" "}
                        </span>
                        {s.note}
                      </p>
                    )}
                  </div>
                  {Array.isArray(s.files) && s.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/30 dark:border-gray-700/30">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
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
                                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline break-all text-sm font-medium"
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
