import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import type { PublicLink } from "../types";
import { ExternalLink } from "lucide-react";

interface LinkCardProps {
  link: PublicLink;
}

export function LinkCard({ link }: LinkCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const { user } = useAuth();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Create ripple effect
    const button = cardRef.current;
    const ripple = rippleRef.current;
    if (button && ripple) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Reset and position ripple
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.opacity = "1";

      // Trigger animation
      ripple.classList.remove("animate-ripple"); // Reset animation
      void ripple.offsetWidth; // Force reflow
      ripple.classList.add("animate-ripple");
    }

    // Track click (include user_id if authenticated, null for anonymous)
    void supabase.from("link_clicks").insert([
      {
        link_id: link.link_id,
        user_agent: navigator.userAgent,
        user_id: user?.id ?? null,
      },
    ]);

    // Reset ripple after animation completes
    setTimeout(() => {
      if (ripple) {
        ripple.classList.remove("animate-ripple");
        ripple.style.opacity = "0";
      }
    }, 600);
  };

  return (
    <a
      ref={cardRef}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        group relative overflow-hidden
        rounded-xl border border-gray-200/80 dark:border-gray-700/80
        bg-purple-50 dark:bg-gray-800/80 backdrop-blur-sm
        px-6 py-4
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-black/30
        active:scale-[0.98]
        cursor-pointer
        ${isPressed ? "shadow-md" : ""}
      `}
    >
      {/* Ripple effect */}
      <span
        ref={rippleRef}
        className="absolute pointer-events-none rounded-full bg-white/40 dark:bg-white/20 opacity-0"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {link.emoji && (
            <span className="text-2xl shrink-0" aria-hidden="true">
              {link.emoji}
            </span>
          )}
          <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
            {link.label}
          </span>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-purple-500/5 transition-all duration-200 pointer-events-none" />
    </a>
  );
}
