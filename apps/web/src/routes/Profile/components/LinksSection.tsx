import { supabase } from "@/lib/supabase";
import type { PublicLink } from "../types";

interface LinksSectionProps {
  links: PublicLink[];
}

export function LinksSection({ links }: LinksSectionProps) {
  return (
    <div className="mt-6 grid gap-3">
      {links.map((l) => (
        <a
          key={l.link_id}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 text-center font-medium hover:opacity-90 transition-all shadow-sm opacity-100"
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
  );
}
