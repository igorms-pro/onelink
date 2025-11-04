import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isBaseHost } from "../lib/domain";
import { getPlanBySlug } from "../lib/profile";
import { Header } from "../components/Header";

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
type PublicDrop = {
  drop_id: string;
  label: string;
  emoji: string | null;
  order: number;
  max_file_size_mb: number | null;
};

export default function Profile() {
  const { slug } = useParams();
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [drops, setDrops] = useState<PublicDrop[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<
    "not_found" | "domain_unverified" | null
  >(null);
  const host = window.location.host;

  useEffect(() => {
    setIsLoading(true);
    setErrorType(null);
    (async () => {
      if (isBaseHost(host)) {
        if (!slug) {
          setIsLoading(false);
          setErrorType("not_found");
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
          return;
        }
        const p = await getPlanBySlug(domainResult);
        setPlan(p);
        maybeInjectGA(p);
        setIsLoading(false);
      }
    })();
  }, [host, slug]);

  async function loadBySlug(s: string): Promise<boolean> {
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
    });

    const { data } = await supabase.rpc("get_links_by_slug", { p_slug: s });
    setLinks(Array.isArray(data) ? (data as PublicLink[]) : []);
    // Fetch drops via RPC (includes max_file_size_mb)
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
    // Fetch drops via RPC (includes max_file_size_mb)
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
    setDrops(
      Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : [],
    );
    return s;
  }

  function maybeInjectGA(p: string) {
    const gaId = import.meta.env.VITE_GA_ID as string | undefined;
    if (p !== "pro" || !gaId) return;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>
        <div className="relative z-10">
          <Header />
          <main className="flex-1 mx-auto max-w-md w-full p-6 flex items-center justify-center min-h-[60vh]">
            <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading profile…
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>
        <div className="relative z-10">
          <Header />
          <main className="flex-1 mx-auto max-w-md w-full p-6 flex items-center justify-center min-h-[60vh]">
            <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {errorType === "domain_unverified"
                  ? "Domain not verified"
                  : "Profile not found"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorType === "domain_unverified"
                  ? "This domain exists but hasn't been verified yet. Please contact the owner."
                  : "The profile you're looking for doesn't exist or has been removed."}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                Go home
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>
      <div className="relative z-10">
        <Header />
        <main className="flex-1 mx-auto max-w-md w-full p-6">
          <header className="flex items-center gap-3">
            {profile?.avatar_url && (
              <img
                className="h-12 w-12 rounded-full"
                src={profile.avatar_url}
              />
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
                  void supabase
                    .from("link_clicks")
                    .insert([
                      { link_id: l.link_id, user_agent: navigator.userAgent },
                    ]);
                }}
              >
                {l.emoji ? `${l.emoji} ` : ""}
                {l.label}
              </a>
            ))}
          </div>

          {drops.length > 0 && (
            <section className="mt-8 grid gap-6">
              {drops.map((d) => (
                <form
                  key={d.drop_id}
                  className="rounded border p-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const formData = new FormData(form);
                    const name = (formData.get("name") as string) || null;
                    const email = (formData.get("email") as string) || null;
                    const note = (formData.get("note") as string) || null;
                    const filesInput = form.querySelector(
                      'input[name="files"]',
                    ) as HTMLInputElement | null;
                    const files = filesInput?.files
                      ? Array.from(filesInput.files)
                      : [];
                    const maxSizeMB = d.max_file_size_mb ?? 50;
                    const maxSizeBytes = maxSizeMB * 1024 * 1024;
                    // Client-side validation
                    for (const f of files) {
                      if (f.size > maxSizeBytes) {
                        alert(`File "${f.name}" exceeds ${maxSizeMB}MB limit.`);
                        return;
                      }
                      // Block dangerous file types
                      const ext = f.name.split(".").pop()?.toLowerCase() || "";
                      const blocked = [
                        "exe",
                        "bat",
                        "cmd",
                        "com",
                        "pif",
                        "scr",
                        "vbs",
                        "js",
                        "jar",
                        "app",
                        "dmg",
                      ];
                      if (blocked.includes(ext)) {
                        alert(`File type .${ext} is not allowed.`);
                        return;
                      }
                    }
                    try {
                      // 1) Upload files to Supabase Storage (bucket: "drops")
                      const uploaded: {
                        path: string;
                        size: number;
                        content_type: string | null;
                      }[] = [];
                      for (const f of files) {
                        const ext = f.name.split(".").pop() || "bin";
                        const key = `${d.drop_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
                        const { error: upErr } = await supabase.storage
                          .from("drops")
                          .upload(key, f, {
                            contentType: f.type || undefined,
                            upsert: false,
                          });
                        if (upErr) throw upErr;
                        uploaded.push({
                          path: key,
                          size: f.size,
                          content_type: f.type || null,
                        });
                      }

                      // 2) Create submission row with uploaded file paths
                      const { error } = await supabase
                        .from("submissions")
                        .insert([
                          {
                            drop_id: d.drop_id,
                            name,
                            email,
                            note,
                            files: uploaded,
                            user_agent: navigator.userAgent,
                          },
                        ]);
                      if (error) throw error;
                      alert("Submitted successfully.");
                      form.reset();
                    } catch (err) {
                      console.error(err);
                      alert("Submission failed");
                    }
                  }}
                >
                  <h2 className="font-medium mb-2">
                    {d.emoji ? `${d.emoji} ` : ""}
                    {d.label}
                  </h2>
                  <div className="grid gap-2">
                    <input
                      name="name"
                      placeholder="Your name (optional)"
                      className="rounded border px-3 py-2"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Your email (optional)"
                      className="rounded border px-3 py-2"
                    />
                    <textarea
                      name="note"
                      placeholder="Note (optional)"
                      className="rounded border px-3 py-2"
                    />
                    <input
                      name="files"
                      type="file"
                      multiple
                      className="rounded border px-3 py-2"
                    />
                    <button
                      type="submit"
                      className="rounded bg-black text-white px-4 py-2"
                    >
                      Send
                    </button>
                  </div>
                </form>
              ))}
            </section>
          )}

          {isBaseHost(host) && plan !== "pro" && (
            <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Powered by OneLink
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
