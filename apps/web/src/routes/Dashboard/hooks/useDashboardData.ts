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
    if (!userId) return;

    execute(async () => {
      const prof = await getOrCreateProfile(userId);

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
      if (linksError) console.error(linksError);
      setLinks(linksData ?? []);

      // Load drops (include visibility fields)
      const { data: dropsData, error: dropsError } = await supabase
        .from("drops")
        .select("id,label,emoji,order,is_active,is_public,share_token")
        .eq("profile_id", prof.id)
        .order("order", { ascending: true });
      if (dropsError) console.error(dropsError);
      setDrops(dropsData ?? []);

      // Load plan
      const planValue = await getSelfPlan(userId);
      setPlan(planValue);

      // Load submissions
      const { data: submissionsData, error: submissionsError } =
        await supabase.rpc("get_submissions_by_profile", {
          p_profile_id: prof.id,
        });
      if (submissionsError) console.error(submissionsError);
      setSubmissions(
        Array.isArray(submissionsData)
          ? (submissionsData as SubmissionRow[])
          : [],
      );
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
