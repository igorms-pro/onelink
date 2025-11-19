import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isBaseHost } from "@/lib/domain";
import { Footer } from "@/components/Footer";
import { isProPlan } from "@/lib/types/plan";
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

  // SEO Meta Tags
  useEffect(() => {
    if (!profile) return;

    const profileUrl = `${window.location.origin}/${slug}`;
    const displayName = profile.display_name || profile.slug || "Profile";
    const description = profile.bio || `${displayName}'s OneLink profile`;
    const ogImage = profile.avatar_url || `${window.location.origin}/logo.png`;

    // Update title
    document.title = `${displayName} | OneLink`;

    // Update or create meta tags
    const updateMetaTag = (
      property: string,
      content: string,
      isProperty = false,
    ) => {
      const selector = isProperty
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("og:title", `${displayName} | OneLink`, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", "profile", true);
    updateMetaTag("og:url", profileUrl, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:image:width", "1200", true);
    updateMetaTag("og:image:height", "630", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary", true);
    updateMetaTag("twitter:title", `${displayName} | OneLink`, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", ogImage, true);

    // Cleanup function
    return () => {
      document.title = "OneLink";
    };
  }, [profile, slug]);

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

      <div className="relative z-10 flex-1 flex flex-col">
        <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-8">
          {profile && (
            <>
              <ProfileHeader profile={profile} links={links} />
              <LinksSection links={links} />
              <DropsSection drops={drops} />
            </>
          )}
        </main>

        {/* Unified Footer with controls - naturally at bottom */}
        <Footer
          variant={
            isBaseHost(host) && !isProPlan(plan) ? "transparent" : "default"
          }
          showBranding={isBaseHost(host) && !isProPlan(plan)}
          brandingText={
            isBaseHost(host) && !isProPlan(plan)
              ? t("profile_slogan")
              : undefined
          }
          showControls
        />
      </div>
    </div>
  );
}
