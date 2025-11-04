import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  ProfileEditor,
  type ProfileForm,
  type ProfileEditorRef,
} from "@/components/ProfileEditor";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { SubmissionCountsCard } from "./SubmissionCountsCard";
import { toast } from "sonner";

interface AccountTabProps {
  profileId: string | null;
  profileFormInitial: ProfileForm | null;
}

export function AccountTab({ profileId, profileFormInitial }: AccountTabProps) {
  const profileEditorRef = useRef<ProfileEditorRef>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Profile editor */}
      <section className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Manage your public profile settings
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
                const errorMessage =
                  "This slug is already taken. Please choose another.";
                profileEditorRef.current?.setError("slug", errorMessage);
                toast.error(errorMessage);
              } else {
                toast.error("Failed to update profile");
              }
              return;
            }
            toast.success("Profile updated successfully");
            setProfileUpdatedAt(data?.updated_at ?? new Date().toISOString());
          }}
        />
        {profileUpdatedAt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Updated at {new Date(profileUpdatedAt).toLocaleString()}
          </p>
        )}
      </section>

      {/* Analytics */}
      <section className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Analytics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Track your link clicks and submissions
        </p>
        <AnalyticsCard profileId={profileId} />
        <SubmissionCountsCard profileId={profileId} />
      </section>
    </div>
  );
}
