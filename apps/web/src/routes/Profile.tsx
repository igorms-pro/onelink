import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";
import { isBaseHost } from "../lib/domain";
import { getPlanBySlug } from "../lib/profile";
import { PlanType, getDefaultPlan, isProPlan } from "../lib/types/plan";
import type { PlanTypeValue } from "../lib/types/plan";

type PublicLink = {
  link_id: string;
  label: string;
  emoji: string | null;
  url: string;
  order: number;
};
type PublicProfile = {
  slug?: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

export default function Profile() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [plan, setPlan] = useState<PlanTypeValue>(getDefaultPlan());
  const host = window.location.host;

  useEffect(() => {
    (async () => {
      if (isBaseHost(host)) {
        if (!slug) return;
        await loadBySlug(slug);
        const p = await getPlanBySlug(slug);
        setPlan(p);
        maybeInjectGA(p);
      } else {
        const s = await loadByDomain(host);
        if (s) {
          const p = await getPlanBySlug(s);
          setPlan(p);
          maybeInjectGA(p);
        }
      }
    })();
  }, [host, slug]);

  async function loadBySlug(s: string) {
    const prof = await supabase
      .from("profiles")
      .select("display_name,bio,avatar_url,slug")
      .eq("slug", s)
      .maybeSingle<{
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
      }>();
    setProfile(prof.data ?? null);

    const { data } = await supabase.rpc("get_links_by_slug", { p_slug: s });
    setLinks(Array.isArray(data) ? (data as PublicLink[]) : []);
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
      };
    };

    const dom = await supabase
      .from("custom_domains")
      .select(
        "verified, profile_id, profiles!inner(display_name,bio,avatar_url,slug)",
      )
      .eq("domain", domain)
      .maybeSingle<DomainJoin>();

    if (!dom.data || dom.data.verified !== true) {
      setProfile(null);
      setLinks([]);
      return null;
    }

    const s = dom.data.profiles.slug;
    setProfile({
      display_name: dom.data.profiles.display_name,
      bio: dom.data.profiles.bio,
      avatar_url: dom.data.profiles.avatar_url,
      slug: s,
    });

    const { data } = await supabase.rpc("get_links_by_slug", { p_slug: s });
    setLinks(Array.isArray(data) ? (data as PublicLink[]) : []);
    return s;
  }

  function maybeInjectGA(p: PlanTypeValue) {
    const gaId = import.meta.env.VITE_GA_ID as string | undefined;
    if (p !== PlanType.PRO || !gaId) return;
    if (document.getElementById("ga-script")) return;
    const s = document.createElement("script");
    s.id = "ga-script";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    const inline = document.createElement("script");
    inline.id = "ga-inline";
    inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
    document.head.appendChild(inline);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <header className="flex items-center gap-3">
        {profile?.avatar_url && (
          <img className="h-12 w-12 rounded-full" src={profile.avatar_url} />
        )}
        <div>
          <h1 className="text-xl font-semibold">
            {profile?.display_name ?? profile?.slug ?? "Profile"}
          </h1>
          {profile?.bio && <p className="text-gray-600">{profile.bio}</p>}
        </div>
      </header>

      <div className="mt-6 grid gap-3">
        {links.map((l) => (
          <a
            key={l.link_id}
            className="rounded bg-black text-white px-4 py-3 text-center"
            href={l.url}
            target="_blank"
            rel="noreferrer"
            onClick={async () => {
              void supabase.from("link_clicks").insert([
                {
                  link_id: l.link_id,
                  user_agent: navigator.userAgent,
                  user_id: user?.id ?? null,
                },
              ]);
            }}
          >
            {l.emoji ? `${l.emoji} ` : ""}
            {l.label}
          </a>
        ))}
      </div>

      {isBaseHost(host) && !isProPlan(plan) && (
        <footer className="mt-8 text-center text-sm text-gray-500">
          Powered by OneMeet
        </footer>
      )}
    </main>
  );
}
