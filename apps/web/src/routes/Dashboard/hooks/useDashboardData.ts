import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateProfile, getSelfPlan } from "@/lib/profile";
import { getDefaultPlan } from "@/lib/types/plan";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import type { PlanTypeValue } from "@/lib/types/plan";
import type { ProfileForm } from "@/components/ProfileEditor";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow, SubmissionRow } from "../types";

export function useDashboardData(userId: string | null) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileFormInitial, setProfileFormInitial] =
    useState<ProfileForm | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [drops, setDrops] = useState<DropRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [plan, setPlan] = useState<PlanTypeValue>(getDefaultPlan());
  const { loading, execute } = useAsyncOperation();

  useEffect(() => {
    console.log("[Dashboard] useEffect triggered", {
      userId,
      hasExecute: !!execute,
    });
    if (!userId) {
      console.log("[Dashboard] No userId, skipping");
      return;
    }

    console.log("[Dashboard] Calling execute with userId:", userId);
    execute(async () => {
      try {
        console.log("[Dashboard] Starting data load for userId:", userId);

        console.log("[Dashboard] Calling getOrCreateProfile...");
        let prof: Awaited<ReturnType<typeof getOrCreateProfile>>;
        try {
          prof = await getOrCreateProfile(userId);
          console.log("[Dashboard] Profile loaded successfully:", {
            id: prof.id,
            slug: prof.slug,
            display_name: prof.display_name,
          });
        } catch (profileError) {
          console.error(
            "[Dashboard] Error in getOrCreateProfile:",
            profileError,
          );
          throw profileError;
        }

        setProfileId(prof.id);
        setProfileFormInitial({
          slug: prof.slug,
          display_name: prof.display_name,
          bio: prof.bio,
          avatar_url: prof.avatar_url,
        });

        // Load links
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("id,label,emoji,url,order")
          .eq("profile_id", prof.id)
          .order("order", { ascending: true });
        if (linksError) {
          console.error("[Dashboard] Error loading links:", linksError);
        } else {
          console.log("[Dashboard] Links loaded:", linksData?.length || 0);
        }
        setLinks(linksData ?? []);

        // Load drops (include visibility fields)
        const { data: dropsData, error: dropsError } = await supabase
          .from("drops")
          .select("id,label,emoji,order,is_active,is_public,share_token")
          .eq("profile_id", prof.id)
          .order("order", { ascending: true });
        if (dropsError) {
          console.error("[Dashboard] Error loading drops:", dropsError);
        } else {
          console.log("[Dashboard] Drops loaded:", dropsData?.length || 0);
        }
        setDrops(dropsData ?? []);

        // Load plan
        const planValue = await getSelfPlan(userId);
        console.log("[Dashboard] Plan loaded:", planValue);
        setPlan(planValue);

        // Load submissions
        const { data: submissionsData, error: submissionsError } =
          await supabase.rpc("get_submissions_by_profile", {
            p_profile_id: prof.id,
          });
        if (submissionsError) {
          console.error(
            "[Dashboard] Error loading submissions:",
            submissionsError,
          );
        } else {
          console.log(
            "[Dashboard] Submissions loaded:",
            submissionsData?.length || 0,
          );
        }
        setSubmissions(
          Array.isArray(submissionsData)
            ? (submissionsData as SubmissionRow[])
            : [],
        );

        console.log("[Dashboard] Data load complete");
      } catch (error) {
        console.error("[Dashboard] Error in data load:", error);
        console.error("[Dashboard] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }).catch((error) => {
      console.error("[Dashboard] Error caught in execute promise:", error);
      console.error("[Dashboard] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  }, [userId, execute]);

  return {
    profileId,
    profileFormInitial,
    links,
    setLinks,
    drops,
    setDrops,
    submissions,
    plan,
    loading,
  };
}
