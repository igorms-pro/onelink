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
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setErrorType(null);

    (async () => {
      try {
        if (isBaseHost(host)) {
          if (!slug) {
            setIsLoading(false);
            setErrorType("not_found");
            loadingRef.current = false;
            return;
          }
          const found = await loadBySlug(slug);
          if (found) {
            const p = await getPlanBySlug(slug);
            setPlan(p);
            maybeInjectGA(p);
          } else {
            setErrorType("not_found");
          }
          setIsLoading(false);
        } else {
          const domainResult = await loadByDomain(host);
          if (!domainResult) {
            setIsLoading(false);
            setErrorType("domain_unverified");
            loadingRef.current = false;
            return;
          }
          const p = await getPlanBySlug(domainResult);
          setPlan(p);
          maybeInjectGA(p);
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
        setErrorType("not_found");
      } finally {
        loadingRef.current = false;
      }
    })();
  }, [host, slug]);

  async function loadBySlug(s: string): Promise<boolean> {
    const prof = await supabase
      .from("profiles")
      .select("display_name,bio,avatar_url,slug,id,user_id")
      .eq("slug", s)
      .maybeSingle<{
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
        id: string;
        user_id: string;
      }>();

    if (!prof.data) {
      setProfile(null);
      setLinks([]);
      setDrops([]);
      return false;
    }

    setProfile({
      display_name: prof.data.display_name,
      bio: prof.data.bio,
      avatar_url: prof.data.avatar_url,
      slug: prof.data.slug,
      user_id: prof.data.user_id, // Store user_id for isOwner check
    });

    const { data: linksData } = await supabase.rpc("get_links_by_slug", {
      p_slug: s,
    });
    setLinks(Array.isArray(linksData) ? (linksData as PublicLink[]) : []);

    // Fetch drops - RPC filters by is_public = true and is_active = true
    // Only public drops are returned for the public profile page
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
    setDrops(
      Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : [],
    );
    return true;
  }

  async function loadByDomain(domain: string) {
    type DomainJoin = {
      verified: boolean;
      profile_id: string;
      profiles: {
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
        user_id: string;
      };
    };

    const dom = await supabase
      .from("custom_domains")
      .select(
        "verified, profile_id, profiles!inner(display_name,bio,avatar_url,slug,user_id)",
      )
      .eq("domain", domain)
      .maybeSingle<DomainJoin>();

    if (!dom.data || dom.data.verified !== true) {
      setProfile(null);
      setLinks([]);
      setDrops([]);
      return null;
    }

    const s = dom.data.profiles.slug;
    setProfile({
      display_name: dom.data.profiles.display_name,
      bio: dom.data.profiles.bio,
      avatar_url: dom.data.profiles.avatar_url,
      slug: s,
      user_id: dom.data.profiles.user_id,
    });

    const { data: linksData } = await supabase.rpc("get_links_by_slug", {
      p_slug: s,
    });
    setLinks(Array.isArray(linksData) ? (linksData as PublicLink[]) : []);

    // Fetch drops - RPC filters by is_public = true and is_active = true
    // Only public drops are returned for the public profile page
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
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
