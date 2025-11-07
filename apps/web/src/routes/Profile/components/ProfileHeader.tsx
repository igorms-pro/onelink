import type { PublicProfile, PublicLink } from "../types";
import { detectSocialPlatform } from "../utils/socialDetection.tsx";
import { supabase } from "@/lib/supabase";

interface ProfileHeaderProps {
  profile: PublicProfile | null;
  links: PublicLink[];
}

export function ProfileHeader({ profile, links }: ProfileHeaderProps) {
  const displayName = profile?.display_name ?? profile?.slug ?? "Profile";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Extract social links
  const socialLinks = links
    .map((link) => ({
      ...link,
      platform: detectSocialPlatform(link.url),
    }))
    .filter((link) => link.platform !== null);

  const handleSocialClick = async (linkId: string, url: string) => {
    // Track click
    void supabase
      .from("link_clicks")
      .insert([{ link_id: linkId, user_agent: navigator.userAgent }]);

    // Open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <header className="flex flex-col items-center text-center mb-8">
      {/* Avatar */}
      {profile?.avatar_url ? (
        <img
          className="h-28 w-28 rounded-full object-cover ring-4 ring-white/10 dark:ring-gray-800/50 shadow-lg shrink-0 mb-6"
          src={profile.avatar_url}
          alt={displayName}
        />
      ) : (
        <div className="h-28 w-28 rounded-full ring-4 ring-white/10 dark:ring-gray-800/50 shadow-lg shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center text-white text-2xl font-bold mb-6">
          {initials}
        </div>
      )}

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
        {profile?.display_name ?? profile?.slug ?? "Profile"}
      </h1>

      {/* Bio */}
      {profile?.bio && (
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-6">
          {profile.bio}
        </p>
      )}

      {/* Social Icons */}
      {socialLinks.length > 0 && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {socialLinks.map((link) => {
            const icon = link.platform!.icon;
            const Icon = icon === "tiktok" ? null : icon;

            return (
              <button
                key={link.link_id}
                onClick={() => handleSocialClick(link.link_id, link.url)}
                className={`
                  w-12 h-12 rounded-full 
                  bg-white dark:bg-gray-800/80 
                  border border-gray-200/80 dark:border-gray-700/80
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-110 hover:shadow-lg
                  active:scale-95
                  ${link.platform!.color}
                `}
                aria-label={`Visit ${link.platform!.name}`}
              >
                {Icon ? (
                  <Icon className="w-6 h-6" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
