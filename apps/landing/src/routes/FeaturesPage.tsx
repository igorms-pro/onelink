import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import FeaturesSection from "@/components/sections/FeaturesSection";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Link, Upload, Bell, User, Lock, BarChart3 } from "lucide-react";

export default function FeaturesPage() {
  const { t } = useTranslation();

  const features = [
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

  return (
    <SEO
      title="Features - OneLink"
      description="Discover all the powerful features OneLink offers. One link for everything - share links, files, and drops with analytics and customization."
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
                  Powerful Features
                </h1>
                <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                  Everything you need to share your content, files, and links in
                  one beautiful place.
                </p>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <FeaturesSection />

          {/* Detailed Features */}
          <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="space-y-16">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-8 lg:grid-cols-2 items-center"
                  >
                    <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-4">
                        <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {feature.title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start gap-3 text-gray-600 dark:text-gray-300"
                          >
                            <span className="mt-1 rounded-full bg-purple-500/10 p-1 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                      {/* Screenshot placeholder */}
                      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-gray-400 dark:text-gray-600 text-sm">
                            SCREENSHOT: {feature.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </SEO>
  );
}
