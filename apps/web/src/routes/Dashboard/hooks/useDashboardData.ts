import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateProfile, getSelfPlan } from "@/lib/profile";
import { useSubmissionsRealtime } from "@/hooks/useSubmissionsRealtime";
import { useFileDownloadsRealtime } from "@/hooks/useFileDownloadsRealtime";
import type { ProfileForm } from "@/components/ProfileEditor";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow, SubmissionRow, DownloadRow } from "../types";

export function useDashboardData(userId: string | null) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileFormInitial, setProfileFormInitial] =
    useState<ProfileForm | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [drops, setDrops] = useState<DropRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      const prof = await getOrCreateProfile(userId);
      if (!mounted) return;

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
      if (!mounted) return;
      if (linksError) console.error(linksError);
      setLinks(linksData ?? []);

      // Load drops (include visibility fields)
      const { data: dropsData, error: dropsError } = await supabase
        .from("drops")
        .select("id,label,emoji,order,is_active,is_public,share_token")
        .eq("profile_id", prof.id)
        .order("order", { ascending: true });
      if (!mounted) return;
      if (dropsError) console.error(dropsError);
      setDrops(dropsData ?? []);

      // Load plan
      const planValue = await getSelfPlan(userId);
      if (!mounted) return;
      setPlan(planValue);

      // Load submissions
      const { data: submissionsData, error: submissionsError } =
        await supabase.rpc("get_submissions_by_profile", {
          p_profile_id: prof.id,
        });
      if (!mounted) return;
      if (submissionsError) console.error(submissionsError);
      setSubmissions(
        Array.isArray(submissionsData)
          ? (submissionsData as SubmissionRow[])
          : [],
      );

      // Load downloads
      const { data: downloadsData, error: downloadsError } = await supabase.rpc(
        "get_downloads_by_profile",
        {
          p_profile_id: prof.id,
        },
      );
      if (!mounted) return;
      if (downloadsError) console.error(downloadsError);
      setDownloads(
        Array.isArray(downloadsData) ? (downloadsData as DownloadRow[]) : [],
      );

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // Integrate realtime subscription for submissions
  useSubmissionsRealtime({
    profileId,
    setSubmissions,
  });

  // Integrate realtime subscription for downloads
  useFileDownloadsRealtime({
    profileId,
    setDownloads,
  });

  // Calculate unread count (submissions where read_at is null)
  const unreadCount = useMemo(() => {
    return submissions.filter((s) => s.read_at === null).length;
  }, [submissions]);

  const refreshInbox = async () => {
    if (!profileId) return false;

    try {
      // Refresh submissions
      const { data: submissionsData, error: submissionsError } =
        await supabase.rpc("get_submissions_by_profile", {
          p_profile_id: profileId,
        });

      if (submissionsError) {
        console.error("Failed to refresh submissions:", submissionsError);
        return false;
      }

      setSubmissions(
        Array.isArray(submissionsData)
          ? (submissionsData as SubmissionRow[])
          : [],
      );

      // Refresh downloads
      const { data: downloadsData, error: downloadsError } = await supabase.rpc(
        "get_downloads_by_profile",
        {
          p_profile_id: profileId,
        },
      );

      if (downloadsError) {
        console.error("Failed to refresh downloads:", downloadsError);
        // Don't fail completely if downloads fail
      } else {
        setDownloads(
          Array.isArray(downloadsData) ? (downloadsData as DownloadRow[]) : [],
        );
      }

      return true;
    } catch (error) {
      console.error("Error refreshing inbox:", error);
      return false;
    }
  };

  const clearAllSubmissions = async () => {
    if (!profileId) return false;

    try {
      const { error } = await supabase.rpc("delete_submissions_by_profile", {
        p_profile_id: profileId,
      });

      if (error) {
        console.error("Failed to clear submissions:", error);
        return false;
      }

      // Refresh submissions after clearing
      const { data: submissionsData, error: submissionsError } =
        await supabase.rpc("get_submissions_by_profile", {
          p_profile_id: profileId,
        });

      if (submissionsError) {
        console.error("Failed to refresh submissions:", submissionsError);
        return false;
      }

      setSubmissions(
        Array.isArray(submissionsData)
          ? (submissionsData as SubmissionRow[])
          : [],
      );

      return true;
    } catch (error) {
      console.error("Error clearing submissions:", error);
      return false;
    }
  };

  return {
    profileId,
    profileFormInitial,
    links,
    setLinks,
    drops,
    setDrops,
    submissions,
    setSubmissions,
    downloads,
    setDownloads,
    unreadCount,
    plan,
    loading,
    refreshInbox,
    clearAllSubmissions,
  };
}
