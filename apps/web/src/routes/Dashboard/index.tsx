import { useState } from "react";
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

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6 text-gray-900 dark:text-white">
          {t("dashboard_loading")}
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("dashboard_please_sign_in")}
          </h1>
          <a
            className="text-blue-600 dark:text-blue-300 underline"
            href="/auth"
          >
            {t("dashboard_go_to_sign_in")}
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <DashboardHeader isFree={isFree} onSignOut={() => signOut()} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 pt-[140px] sm:pt-6 pb-20 sm:pb-4 overflow-y-auto">
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
