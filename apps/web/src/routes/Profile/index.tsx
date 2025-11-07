import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isBaseHost } from "@/lib/domain";
import { useProfileData } from "./hooks/useProfileData";
import {
  LoadingState,
  ErrorState,
  ProfileHeader,
  LinksSection,
  DropsSection,
  ProfileBottomBar,
} from "./components";

export default function Profile() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const host = window.location.host;
  const { links, drops, profile, plan, isLoading, errorType } = useProfileData(
    slug,
    host,
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile && !isLoading) {
    return <ErrorState errorType={errorType} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative">
      {/* Background image - light mode */}
      <div
        className="fixed inset-0 pointer-events-none dark:hidden z-0"
        style={{
          backgroundImage: "url(/screen.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Background image - dark mode */}
      <div
        className="fixed inset-0 pointer-events-none hidden dark:block z-0"
        style={{
          backgroundImage: "url(/screen-dark.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Gradient blobs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/5 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/5 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300/5 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-200/5 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-1 pb-20">
        <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {profile && (
            <>
              <ProfileHeader profile={profile} />
              <LinksSection links={links} />
              <DropsSection drops={drops} />
              {isBaseHost(host) && plan !== "pro" && (
                <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("profile_slogan")}
                </footer>
              )}
            </>
          )}
        </main>
      </div>

      <ProfileBottomBar />
    </div>
  );
}
