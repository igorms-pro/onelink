import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { SettingsModal } from "@/components/SettingsModal";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  DashboardHeader,
  TabNavigation,
  InboxTab,
  ContentTab,
  AccountTab,
} from "./components";
import type { TabId } from "./types";

const FREE_LIMIT = 3;

export default function Dashboard() {
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6 text-gray-900 dark:text-white">
          Loading…
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <main className="mx-auto max-w-md p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Please sign in
          </h1>
          <a
            className="text-blue-600 dark:text-blue-400 underline"
            href="/auth"
          >
            Go to sign in
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex-1 mx-auto max-w-4xl w-full p-4 md:p-6 lg:p-8">
          <DashboardHeader
            isFree={isFree}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onSignOut={() => signOut()}
          />

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
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
