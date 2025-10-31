import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isBaseHost } from "../lib/domain";
import { getPlanBySlug } from "../lib/profile";

type PublicLink = { link_id: string; label: string; emoji: string | null; url: string; order: number };
type PublicProfile = { slug?: string; display_name?: string | null; bio?: string | null; avatar_url?: string | null };
type PublicDrop = { drop_id: string; label: string; emoji: string | null; order: number; max_file_size_mb: number | null };

export default function Profile() {
  const { slug } = useParams();
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [drops, setDrops] = useState<PublicDrop[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [plan, setPlan] = useState<string>("free");
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
      .select("display_name,bio,avatar_url,slug,id")
      .eq("slug", s)
      .maybeSingle<{
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        slug: string;
        id: string;
      }>();
    setProfile(prof.data ? { display_name: prof.data.display_name, bio: prof.data.bio, avatar_url: prof.data.avatar_url, slug: prof.data.slug } : null);

    const { data } = await supabase.rpc("get_links_by_slug", { p_slug: s });
    setLinks(Array.isArray(data) ? (data as PublicLink[]) : []);
    // Fetch drops via RPC (includes max_file_size_mb)
    const dropsRes = await supabase.rpc("get_drops_by_slug", { p_slug: s });
    setDrops(Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : []);
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
        "verified, profile_id, profiles!inner(display_name,bio,avatar_url,slug)"
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
    setDrops(Array.isArray(dropsRes.data) ? (dropsRes.data as PublicDrop[]) : []);
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

  return (
    <main className="mx-auto max-w-md p-6">
      <header className="flex items-center gap-3">
        {profile?.avatar_url && <img className="h-12 w-12 rounded-full" src={profile.avatar_url} />}
        <div>
          <h1 className="text-xl font-semibold">{profile?.display_name ?? profile?.slug ?? "Profile"}</h1>
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
                .insert([{ link_id: l.link_id, user_agent: navigator.userAgent }]);
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
                const filesInput = form.querySelector('input[name="files"]') as HTMLInputElement | null;
                const files = filesInput?.files ? Array.from(filesInput.files) : [];
                const maxSizeMB = d.max_file_size_mb ?? 50;
                const maxSizeBytes = maxSizeMB * 1024 * 1024;
                // Client-side validation
                for (const f of files) {
                  if (f.size > maxSizeBytes) {
                    alert(`File "${f.name}" exceeds ${maxSizeMB}MB limit.`);
                    return;
                  }
                  // Block dangerous file types
                  const ext = f.name.split('.').pop()?.toLowerCase() || "";
                  const blocked = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'app', 'dmg'];
                  if (blocked.includes(ext)) {
                    alert(`File type .${ext} is not allowed.`);
                    return;
                  }
                }
                try {
                  // 1) Upload files to Supabase Storage (bucket: "drops")
                  const uploaded: { path: string; size: number; content_type: string | null }[] = [];
                  for (const f of files) {
                    const ext = f.name.split('.').pop() || "bin";
                    const key = `${d.drop_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
                    const { error: upErr } = await supabase.storage.from("drops").upload(key, f, {
                      contentType: f.type || undefined,
                      upsert: false,
                    });
                    if (upErr) throw upErr;
                    uploaded.push({ path: key, size: f.size, content_type: f.type || null });
                  }

                  // 2) Create submission row with uploaded file paths
                  const { error } = await supabase
                    .from("submissions")
                    .insert([{ drop_id: d.drop_id, name, email, note, files: uploaded, user_agent: navigator.userAgent }]);
                  if (error) throw error;
                  alert("Submitted successfully.");
                  form.reset();
                } catch (err) {
                  console.error(err);
                  alert("Submission failed");
                }
              }}
            >
              <h2 className="font-medium mb-2">{d.emoji ? `${d.emoji} ` : ""}{d.label}</h2>
              <div className="grid gap-2">
                <input name="name" placeholder="Your name (optional)" className="rounded border px-3 py-2" />
                <input name="email" type="email" placeholder="Your email (optional)" className="rounded border px-3 py-2" />
                <textarea name="note" placeholder="Note (optional)" className="rounded border px-3 py-2" />
                <input name="files" type="file" multiple className="rounded border px-3 py-2" />
                <button type="submit" className="rounded bg-black text-white px-4 py-2">Send</button>
              </div>
            </form>
          ))}
        </section>
      )}

      {isBaseHost(host) && plan !== "pro" && (
        <footer className="mt-8 text-center text-sm text-gray-500">Powered by OneLink</footer>
      )}
    </main>
  );
}
