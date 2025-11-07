import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { SettingsModal } from "@/components/SettingsModal";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  DashboardHeader,
  TabNavigation,
  BottomNavigation,
  InboxTab,
  ContentTab,
  AccountTab,
} from "./components";
import type { TabId } from "./types";

const FREE_LIMIT = 3;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("inbox");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    profileId,
    profileFormInitial,
    links,
    setLinks,
    drops,
    setDrops,
    submissions,
    plan,
    loading: dataLoading,
  } = useDashboardData(user?.id ?? null);

  const isFree = plan !== "pro";

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6 text-gray-900 dark:text-white">
          {t("dashboard_loading")}
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
      {/* Gradient blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/5 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/5 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300/5 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-200/5 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <DashboardHeader isFree={isFree} onSignOut={() => signOut()} />

      <main className="relative flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 pt-[140px] sm:pt-6 pb-20 sm:pb-4 overflow-y-auto">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          submissionCount={submissions.length}
        />

        {/* Tab Content */}
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
              freeLimit={FREE_LIMIT}
            />
          )}
          {activeTab === "account" && (
            <AccountTab
              profileId={profileId}
              profileFormInitial={profileFormInitial}
            />
          )}
        </div>
      </main>

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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={() => signOut()}
      />
    </div>
  );
}
