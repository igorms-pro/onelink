import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isBaseHost } from "@/lib/domain";
import { Header } from "@/components/Header";
import { useProfileData } from "./hooks/useProfileData";
import {
  LoadingState,
  ErrorState,
  ProfileHeader,
  LinksSection,
  DropsSection,
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
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
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
        <main className="flex-1 mx-auto max-w-md w-full p-6">
          <ProfileHeader profile={profile} />
          <LinksSection links={links} />
          <DropsSection drops={drops} />
          {isBaseHost(host) && plan !== "pro" && (
            <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("profile_powered_by")}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
