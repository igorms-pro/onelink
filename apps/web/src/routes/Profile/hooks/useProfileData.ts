import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { isBaseHost } from "@/lib/domain";
import { getPlanBySlug } from "@/lib/profile";
import { getDefaultPlan } from "@/lib/types/plan";
import type { PlanTypeValue } from "@/lib/types/plan";
import { maybeInjectGA } from "../utils/analytics";
import type { PublicLink, PublicProfile, PublicDrop } from "../types";

export function useProfileData(slug: string | undefined, host: string) {
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [drops, setDrops] = useState<PublicDrop[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [plan, setPlan] = useState<PlanTypeValue>(getDefaultPlan());
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<
    "not_found" | "domain_unverified" | null
  >(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log("[Profile] Already loading, skipping");
      return;
    }

    console.log("[Profile] useEffect triggered", {
      slug,
      host,
      isBaseHost: isBaseHost(host),
    });
    loadingRef.current = true;
    setIsLoading(true);
    setErrorType(null);

    (async () => {
      try {
        if (isBaseHost(host)) {
          if (!slug) {
            console.log("[Profile] No slug provided");
            setIsLoading(false);
            setErrorType("not_found");
            loadingRef.current = false;
            return;
          }
          console.log("[Profile] Loading by slug:", slug);
          const found = await loadBySlug(slug);
          if (found) {
            console.log("[Profile] Profile found by slug");
            const p = await getPlanBySlug(slug);
            setPlan(p);
            maybeInjectGA(p);
          } else {
            console.log("[Profile] Profile not found by slug");
            setErrorType("not_found");
          }
          setIsLoading(false);
        } else {
          console.log("[Profile] Loading by domain:", host);
          const domainResult = await loadByDomain(host);
          if (!domainResult) {
            console.log("[Profile] Domain not verified or not found");
            setIsLoading(false);
            setErrorType("domain_unverified");
            loadingRef.current = false;
            return;
          }
          console.log("[Profile] Profile found by domain, slug:", domainResult);
          const p = await getPlanBySlug(domainResult);
          setPlan(p);
          maybeInjectGA(p);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[Profile] Error loading profile:", error);
        setIsLoading(false);
        setErrorType("not_found");
      } finally {
        loadingRef.current = false;
      }
    })();
  }, [host, slug]);

  async function loadBySlug(s: string): Promise<boolean> {
    console.log("[Profile] loadBySlug called with:", s);
    const prof = await supabase
      .from("profiles")
      .select("display_name,bio,avatar_url,slug,id")
      .eq("slug", s)
      .maybeSingle<{
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
        id: string;
      }>();

    console.log("[Profile] Profile query result:", {
      data: prof.data,
      error: prof.error,
    });

    if (prof.error) {
      console.error("[Profile] Error fetching profile:", prof.error);
    }

    if (!prof.data) {
      console.log("[Profile] No profile data found");
      setProfile(null);
      setLinks([]);
      setDrops([]);
      return false;
    }

    console.log("[Profile] Setting profile data:", prof.data);
    setProfile({
      display_name: prof.data.display_name,
      bio: prof.data.bio,
      avatar_url: prof.data.avatar_url,
      slug: prof.data.slug,
    });

    const { data: linksData, error: linksError } = await supabase.rpc(
      "get_links_by_slug",
      { p_slug: s },
    );
    if (linksError) {
      console.error("[Profile] Error fetching links:", linksError);
    } else {
      console.log("[Profile] Links loaded:", linksData?.length || 0);
    }
    setLinks(Array.isArray(linksData) ? (linksData as PublicLink[]) : []);

    // Fetch drops - RPC filters by is_public = true and is_active = true
    // Only public drops are returned for the public profile page
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
    if (dropsRes.error) {
      console.error("[Profile] Error fetching drops:", dropsRes.error);
    } else {
      console.log("[Profile] Drops loaded:", dropsRes.data?.length || 0);
    }
    setDrops(
      Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : [],
    );
    return true;
  }

  async function loadByDomain(domain: string) {
    console.log("[Profile] loadByDomain called with:", domain);
    type DomainJoin = {
      verified: boolean;
      profile_id: string;
      profiles: {
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
      };
    };

    const dom = await supabase
      .from("custom_domains")
      .select(
        "verified, profile_id, profiles!inner(display_name,bio,avatar_url,slug)",
      )
      .eq("domain", domain)
      .maybeSingle<DomainJoin>();

    console.log("[Profile] Domain query result:", {
      data: dom.data,
      error: dom.error,
    });

    if (dom.error) {
      console.error("[Profile] Error fetching domain:", dom.error);
    }

    if (!dom.data || dom.data.verified !== true) {
      console.log("[Profile] Domain not verified or not found");
      setProfile(null);
      setLinks([]);
      setDrops([]);
      return null;
    }

    const s = dom.data.profiles.slug;
    console.log(
      "[Profile] Setting profile data from domain:",
      dom.data.profiles,
    );
    setProfile({
      display_name: dom.data.profiles.display_name,
      bio: dom.data.profiles.bio,
      avatar_url: dom.data.profiles.avatar_url,
      slug: s,
    });

    const { data: linksData, error: linksError } = await supabase.rpc(
      "get_links_by_slug",
      { p_slug: s },
    );
    if (linksError) {
      console.error("[Profile] Error fetching links:", linksError);
    } else {
      console.log("[Profile] Links loaded:", linksData?.length || 0);
    }
    setLinks(Array.isArray(linksData) ? (linksData as PublicLink[]) : []);

    // Fetch drops - RPC filters by is_public = true and is_active = true
    // Only public drops are returned for the public profile page
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
    if (dropsRes.error) {
      console.error("[Profile] Error fetching drops:", dropsRes.error);
    } else {
      console.log("[Profile] Drops loaded:", dropsRes.data?.length || 0);
    }
    setDrops(
      Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : [],
    );
    return s;
  }

  return {
    links,
    drops,
    profile,
    plan,
    isLoading,
    errorType,
  };
}
