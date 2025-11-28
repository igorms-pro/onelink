import { supabase } from "@/lib/supabase";
import type { ExportDataType } from "./useDataExport";

export interface ExportData {
  profile?: unknown;
  links?: unknown[];
  drops?: unknown[];
  submissions?: unknown[];
  analytics?: unknown;
}

/**
 * Fetches user data from Supabase for export
 */
export async function fetchUserData(
  userId: string,
  dataTypes: Set<ExportDataType>,
  onProgress: (progress: number) => void,
): Promise<ExportData> {
  const data: ExportData = {};
  const totalSteps = dataTypes.size;
  let currentStep = 0;

  // Get profile_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Fetch profile data
  if (dataTypes.has("profile")) {
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    data.profile = profile;
  }

  // Fetch links
  if (dataTypes.has("links")) {
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("order_index", { ascending: true });
    data.links = linksData || [];
  }

  // Fetch drops
  if (dataTypes.has("drops")) {
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    const { data: dropsData } = await supabase
      .from("drops")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    data.drops = dropsData || [];
  }

  // Fetch submissions
  if (dataTypes.has("submissions")) {
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    const { data: submissionsData } = await supabase
      .from("submissions")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    data.submissions = submissionsData || [];
  }

  // Fetch analytics (clicks, views, etc.)
  if (dataTypes.has("analytics")) {
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    // For now, we'll fetch link clicks and drop views
    // In the future, this could be aggregated from a separate analytics table
    const { data: linkClicks } = await supabase
      .from("link_clicks")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1000); // Limit to prevent huge exports

    const { data: dropViews } = await supabase
      .from("drop_views")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1000);

    data.analytics = {
      link_clicks: linkClicks || [],
      drop_views: dropViews || [],
    };
  }

  onProgress(100);
  return data;
}
