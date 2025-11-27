import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  DashboardSubHeader,
  TabNavigation,
  BottomNavigation,
  InboxTab,
  ContentTab,
  AccountTab,
} from "./components";
import type { TabId } from "./types";

import { getFreeLinksLimit, getFreeDropsLimit } from "@/lib/plan-limits";
import { isPaidPlan } from "@/lib/types/plan";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("inbox");

  const {
    profileId,
    profileFormInitial,
    links,
    setLinks,
    drops,
    setDrops,
    submissions,
    plan,
  } = useDashboardData(user?.id ?? null);

  const isFree = !isPaidPlan(plan);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, user, navigate]);

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
      {/* Gradient blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/5 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/5 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300/5 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-200/5 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Headers - sticky on mobile, participate in flexbox */}
      <div className="shrink-0">
        <Header onSettingsClick={() => navigate("/settings")} />
        <DashboardSubHeader plan={plan} onSignOut={() => signOut()} />
      </div>

      {/* Main content area - takes remaining space and scrolls */}
      <div className="flex-1 min-h-0 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 pb-20 sm:pb-4 flex flex-col overflow-hidden">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          submissionCount={submissions.length}
        />

        {/* Clear All button - Desktop only, outside scrollable area */}
        {activeTab === "inbox" && submissions.length + 6 > 0 && (
          <div className="hidden sm:flex justify-end  shrink-0">
            <button
              onClick={() => {
                if (confirm(t("dashboard_inbox_clear_all_confirm"))) {
                  // TODO: Implement actual clear functionality with database
                  console.log("Clear all clicked");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t("dashboard_inbox_clear_all")}
            </button>
          </div>
        )}

        {/* Tab Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="transition-opacity duration-200">
            {activeTab === "inbox" && <InboxTab submissions={submissions} />}
            {activeTab === "content" && (
              <ContentTab
                profileId={profileId}
                links={links}
                setLinks={setLinks}
                drops={drops}
                setDrops={setDrops}
                isFree={isFree}
                freeLinksLimit={getFreeLinksLimit()}
                freeDropsLimit={getFreeDropsLimit()}
              />
            )}
            {activeTab === "account" && (
              <AccountTab
                profileId={profileId}
                profileFormInitial={profileFormInitial}
                isFree={isFree}
              />
            )}
          </div>
        </div>
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        submissionCount={submissions.length + 6}
        onClearAll={() => {
          if (confirm("Clear all inbox items? This cannot be undone.")) {
            // TODO: Implement actual clear functionality with database
            console.log("Clear all clicked");
          }
        }}
      />
    </div>
  );
}
