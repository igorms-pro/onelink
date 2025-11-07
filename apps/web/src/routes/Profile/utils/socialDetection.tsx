import {
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  type LucideIcon,
} from "lucide-react";

export type SocialPlatform = {
  name: string;
  icon: LucideIcon | "tiktok"; // Use string for custom icons
  color: string; // Tailwind text color class
  pattern: RegExp;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600 dark:text-pink-500",
    pattern: /instagram\.com/i,
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "text-sky-500 dark:text-sky-400",
    pattern: /(twitter\.com|x\.com)/i,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700 dark:text-blue-600",
    pattern: /linkedin\.com/i,
  },
  {
    name: "GitHub",
    icon: Github,
    color: "text-gray-900 dark:text-gray-100",
    pattern: /github\.com/i,
  },
  {
    name: "YouTube",
    icon: Youtube,
    color: "text-red-600 dark:text-red-500",
    pattern: /youtube\.com|youtu\.be/i,
  },
  {
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600 dark:text-blue-500",
    pattern: /facebook\.com|fb\.com/i,
  },
  {
    name: "TikTok",
    icon: "tiktok",
    color: "text-gray-900 dark:text-white",
    pattern: /tiktok\.com/i,
  },
];

export function detectSocialPlatform(url: string): SocialPlatform | null {
  for (const platform of SOCIAL_PLATFORMS) {
    if (platform.pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

export function isSocialLink(url: string): boolean {
  return detectSocialPlatform(url) !== null;
}
