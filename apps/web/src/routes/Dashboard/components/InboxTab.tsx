import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Upload, Check, CheckCheck, Download, RefreshCw } from "lucide-react";
import type { SubmissionRow, DownloadRow } from "../types";
import { InboxSkeleton } from "./InboxSkeleton";

interface InboxTabProps {
  submissions: SubmissionRow[];
  downloads: DownloadRow[];
  profileId: string | null;
  setSubmissions: React.Dispatch<React.SetStateAction<SubmissionRow[]>>;
  refreshInbox: () => Promise<boolean>;
  loading?: boolean;
}

export function InboxTab({
  submissions,
  downloads,
  profileId,
  setSubmissions,
  refreshInbox,
  loading = false,
}: InboxTabProps) {
  const { t } = useTranslation();
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const unreadCount = submissions.filter((s) => !s.read_at).length;

  // Combine submissions and downloads, sorted by date (most recent first)
  const allItems = useMemo(() => {
    const submissionItems = submissions.map((s) => ({
      type: "submission" as const,
      id: s.submission_id,
      date: s.created_at,
      data: s,
    }));

    const downloadItems = (downloads || []).map((d) => ({
      type: "download" as const,
      id: `download-${d.download_id}`,
      date: d.downloaded_at,
      data: d,
    }));

    return [...submissionItems, ...downloadItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [submissions, downloads]);

  const handleMarkAsRead = async (submissionId: string) => {
    if (markingRead) return;
    setMarkingRead(submissionId);

    try {
      const { error } = await supabase.rpc("mark_submission_read", {
        p_submission_id: submissionId,
      });

      if (error) {
        console.error("Failed to mark submission as read:", error);
        alert(
          t("dashboard_inbox_mark_read_error") ||
            "Failed to mark submission as read",
        );
      } else {
        // Update local state
        setSubmissions((prev) =>
          prev.map((s) =>
            s.submission_id === submissionId
              ? { ...s, read_at: new Date().toISOString() }
              : s,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking submission as read:", error);
      alert(
        t("dashboard_inbox_mark_read_error") ||
          "Failed to mark submission as read",
      );
    } finally {
      setMarkingRead(null);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);

    try {
      const success = await refreshInbox();
      if (!success) {
        alert(t("dashboard_inbox_refresh_error") || "Failed to refresh inbox");
      }
    } catch (error) {
      console.error("Error refreshing inbox:", error);
      alert(t("dashboard_inbox_refresh_error") || "Failed to refresh inbox");
    } finally {
      setRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [refreshing, refreshInbox, t]);

  const handleMarkAllAsRead = async () => {
    if (!profileId || markingAllRead) return;
    setMarkingAllRead(true);

    try {
      const { error } = await supabase.rpc("mark_all_submissions_read", {
        p_profile_id: profileId,
      });

      if (error) {
        console.error("Failed to mark all submissions as read:", error);
        alert(
          t("dashboard_inbox_mark_all_read_error") ||
            "Failed to mark all submissions as read",
        );
      } else {
        // Refresh submissions
        const { data: submissionsData, error: submissionsError } =
          await supabase.rpc("get_submissions_by_profile", {
            p_profile_id: profileId,
          });

        if (submissionsError) {
          console.error("Failed to refresh submissions:", submissionsError);
        } else {
          setSubmissions(
            Array.isArray(submissionsData)
              ? (submissionsData as SubmissionRow[])
              : [],
          );
        }
      }
    } catch (error) {
      console.error("Error marking all submissions as read:", error);
      alert(
        t("dashboard_inbox_mark_all_read_error") ||
          "Failed to mark all submissions as read",
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  // Pull-to-refresh handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Find the scrollable parent container
      let element = scrollContainerRef.current?.parentElement;
      let scrollContainer: HTMLElement | null = null;

      while (element) {
        const style = window.getComputedStyle(element);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollContainer = element as HTMLElement;
          break;
        }
        element = element.parentElement;
      }

      // Only enable pull-to-refresh if at the top of the scroll container
      if (scrollContainer && scrollContainer.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
      } else {
        touchStartY.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || refreshing) return;

      // Find the scrollable parent container
      let element = scrollContainerRef.current?.parentElement;
      let scrollContainer: HTMLElement | null = null;

      while (element) {
        const style = window.getComputedStyle(element);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollContainer = element as HTMLElement;
          break;
        }
        element = element.parentElement;
      }

      // Only allow pull down if at the top
      if (scrollContainer && scrollContainer.scrollTop === 0) {
        const touchY = e.touches[0].clientY;
        const distance = touchY - touchStartY.current;

        // Only allow pull down (positive distance)
        if (distance > 0) {
          e.preventDefault(); // Prevent default scroll behavior
          setIsPulling(true);
          // Cap the pull distance at 80px
          setPullDistance(Math.min(distance, 80));
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchStartY.current === null) return;

      // If pulled down enough (60px threshold), trigger refresh
      if (pullDistance >= 60 && !refreshing) {
        handleRefresh();
      } else {
        // Reset if not pulled enough
        setPullDistance(0);
        setIsPulling(false);
      }

      touchStartY.current = null;
    };

    // Use document for touch events to catch them early
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, refreshing, handleRefresh]);

  // Show skeleton while loading
  if (loading) {
    return <InboxSkeleton />;
  }

  // Show empty state only when not loading and no items
  if (allItems.length === 0) {
    return (
      <section data-testid="inbox-scroll-container" className="mt-2 sm:mt-0">
        <div
          data-testid="inbox-empty-state"
          className="rounded-xl bg-gray-50 dark:bg-gray-800 p-8 text-center border border-gray-200 dark:border-gray-700"
        >
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p
            data-testid="inbox-empty-message"
            className="text-gray-600 dark:text-gray-400"
          >
            {t("dashboard_inbox_empty") || "No submissions yet"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={scrollContainerRef}
      data-testid="inbox-scroll-container"
      className="mt-2 sm:mt-0 relative"
      style={{
        transform: isPulling
          ? `translateY(${Math.min(pullDistance, 80)}px)`
          : undefined,
        transition: isPulling ? "none" : "transform 0.2s ease-out",
      }}
    >
      {/* Pull-to-refresh indicator (mobile) */}
      {isPulling && (
        <div
          data-testid="inbox-pull-refresh-indicator"
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 sm:hidden"
          style={{
            transform: `translateY(-${pullDistance}px)`,
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <RefreshCw
            className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${
              pullDistance >= 60 ? "animate-spin" : ""
            }`}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-4 flex justify-between items-center gap-2">
        {/* Refresh button (desktop) */}
        <button
          data-testid="inbox-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("dashboard_inbox_refresh") || "Refresh"}
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {t("dashboard_inbox_refresh") || "Refresh"}
        </button>

        {/* Mark All as Read button */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAllRead
              ? t("dashboard_inbox_marking_all_read") || "Marking..."
              : t("dashboard_inbox_mark_all_read") || "Mark all as read"}
          </button>
        )}
      </div>

      <ul data-testid="inbox-items-list" className="grid gap-3">
        {/* Submissions and Downloads */}
        {allItems.map((item) => {
          if (item.type === "submission") {
            const s = item.data as SubmissionRow;
            const isUnread = !s.read_at;
            return (
              <li
                key={s.submission_id}
                data-testid="inbox-submission-item"
                className={`group relative rounded-xl p-4 transition-all duration-200 border ${
                  isUnread
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isUnread
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-gray-900 dark:bg-gray-700"
                      }`}
                    >
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm ${
                            isUnread
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {s.drop_label ?? t("dashboard_inbox_drop")}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {new Date(s.created_at).toLocaleString()}
                        </p>
                      </div>
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(s.submission_id)}
                          disabled={markingRead === s.submission_id}
                          className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            t("dashboard_inbox_mark_read") || "Mark as read"
                          }
                        >
                          <Check className="w-3 h-3" />
                          {markingRead === s.submission_id
                            ? t("dashboard_inbox_marking") || "..."
                            : t("dashboard_inbox_mark_read") || "Mark read"}
                        </button>
                      )}
                    </div>
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
                                  onClick={async () => {
                                    // Track file download (exclude owner downloads)
                                    void supabase
                                      .from("file_downloads")
                                      .insert([
                                        {
                                          submission_id: s.submission_id,
                                          file_path: f.path,
                                          user_id: null, // Owner downloads (always null for owner)
                                          user_agent: navigator.userAgent,
                                        },
                                      ]);
                                  }}
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
          } else {
            // Download item
            const d = item.data as DownloadRow;
            return (
              <li
                key={`download-${d.download_id}`}
                data-testid="inbox-download-item"
                className="group relative rounded-xl p-4 transition-all duration-200 border bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/20"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-green-900 dark:text-green-100">
                          {t("dashboard_inbox_file_downloaded") ||
                            "File downloaded"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {new Date(d.downloaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard_inbox_drop")}{" "}
                        </span>
                        {d.drop_label ?? t("dashboard_inbox_drop")}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard_inbox_file")}{" "}
                        </span>
                        <span className="font-medium">{d.file_name}</span>
                      </p>
                      {(d.submission_name || d.submission_email) && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("dashboard_inbox_from") || "From"}{" "}
                          </span>
                          {d.submission_name ||
                            d.submission_email ||
                            "Anonymous"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </section>
  );
}
