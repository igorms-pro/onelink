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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors relative overflow-hidden">
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
