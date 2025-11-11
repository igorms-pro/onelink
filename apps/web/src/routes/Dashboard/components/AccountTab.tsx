import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ProfileEditor,
  type ProfileForm,
  type ProfileEditorRef,
} from "@/components/ProfileEditor";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { SubmissionCountsCard } from "./SubmissionCountsCard";
import { ProfileLinkCard } from "./ProfileLinkCard";
import { toast } from "sonner";

interface AccountTabProps {
  profileId: string | null;
  profileFormInitial: ProfileForm | null;
  isFree: boolean;
}

export function AccountTab({
  profileId,
  profileFormInitial,
  isFree,
}: AccountTabProps) {
  const { t } = useTranslation();
  const profileEditorRef = useRef<ProfileEditorRef>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);

  return (
    <div className="space-y-6 mt-2">
      {/* Profile Link */}
      <ProfileLinkCard
        slug={profileFormInitial?.slug ?? null}
        isFree={isFree}
      />

      {/* Profile editor */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {t("dashboard_account_profile_title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t("dashboard_account_profile_description")}
        </p>
        <ProfileEditor
          ref={profileEditorRef}
          initial={profileFormInitial}
          disabled={!profileId}
          onSave={async (values) => {
            if (!profileId) return;
            const { data, error } = await supabase
              .from("profiles")
              .update({
                slug: values.slug,
                display_name: values.display_name,
                bio: values.bio,
                avatar_url: values.avatar_url,
              })
              .eq("id", profileId)
              .select("updated_at")
              .single<{ updated_at: string }>();
            if (error) {
              // Check for PostgreSQL unique constraint violation (error code 23505)
              if (
                error.code === "23505" &&
                (error.message?.includes("slug") ||
                  error.message?.includes("profiles_slug_key") ||
                  error.message?.includes("unique") ||
                  error.message?.toLowerCase().includes("slug"))
              ) {
                const errorMessage = t("dashboard_account_slug_taken");
                profileEditorRef.current?.setError("slug", errorMessage);
                toast.error(errorMessage);
              } else {
                toast.error(t("dashboard_account_profile_update_failed"));
              }
              return;
            }
            toast.success(t("dashboard_account_profile_update_success"));
            setProfileUpdatedAt(data?.updated_at ?? new Date().toISOString());
          }}
        />
        {profileUpdatedAt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("dashboard_account_profile_updated")}{" "}
            {new Date(profileUpdatedAt).toLocaleString()}
          </p>
        )}
      </section>

      {/* Analytics */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-purple-50 dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow">
        <button
          onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
          className="w-full flex items-center justify-between mb-3 text-left cursor-pointer"
          aria-label={
            isAnalyticsExpanded ? t("common_collapse") : t("common_expand")
          }
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("dashboard_account_analytics_title")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("dashboard_account_analytics_description")}
            </p>
          </div>
          {isAnalyticsExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
          )}
        </button>
        {isAnalyticsExpanded && (
          <>
            <AnalyticsCard profileId={profileId} />
            <SubmissionCountsCard profileId={profileId} />
          </>
        )}
      </section>
    </div>
  );
}
