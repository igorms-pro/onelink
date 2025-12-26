import { Link, Upload, Bell, User, Lock, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
}

export function getFeatures(t: (key: string) => string): Feature[] {
  return [
    {
      title: t("landing.features.oneLink.title"),
      description: t("landing.features.oneLink.description"),
      icon: Link,
      details: [
        "Create a single, memorable link for all your content",
        "Share links to your social media, portfolio, calendar, and more",
        "Customize your profile with themes and branding",
        "No more messy bio links or multiple URLs to manage",
      ],
    },
    {
      title: t("landing.features.fileSharing.title"),
      description: t("landing.features.fileSharing.description"),
      icon: Upload,
      details: [
        "Create file drops for easy file collection",
        "Upload multiple files at once",
        "Control visibility with public or private drops",
        "Receive files directly without email attachments",
      ],
    },
    {
      title: t("landing.features.notifications.title"),
      description: t("landing.features.notifications.description"),
      icon: Bell,
      details: [
        "Get notified instantly when someone interacts with your links",
        "Email notifications for new submissions",
        "Real-time badge counting",
        "Never miss an important interaction",
      ],
    },
    {
      title: t("landing.features.customizable.title"),
      description: t("landing.features.customizable.description"),
      icon: User,
      details: [
        "Fully customizable profile with your branding",
        "Dark and light theme support",
        "Custom domain support (Pro plan)",
        "Personalize your link to match your style",
      ],
    },
    {
      title: t("landing.features.privacy.title"),
      description: t("landing.features.privacy.description"),
      icon: Lock,
      details: [
        "Full control over your data and privacy",
        "Public or private drops",
        "Two-factor authentication available",
        "GDPR compliant data hosting",
      ],
    },
    {
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
      icon: BarChart3,
      details: [
        "Track clicks, views, and downloads in real-time",
        "Detailed insights and analytics",
        "7-day history (Free) or 30 & 90-day history (Pro)",
        "Google Analytics integration (Pro plan)",
      ],
    },
  ];
}
