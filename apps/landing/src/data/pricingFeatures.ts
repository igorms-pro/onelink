export interface PricingFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

export const pricingFeatures: PricingFeature[] = [
  {
    name: "Links",
    free: "5 links",
    pro: "Unlimited",
  },
  {
    name: "Drops",
    free: "3 drops",
    pro: "Unlimited",
  },
  {
    name: "File Size",
    free: "50MB per file",
    pro: "2GB per file",
  },
  {
    name: "File Retention",
    free: "7 days",
    pro: "90 days",
  },
  {
    name: "Analytics",
    free: "Basic (7-day history)",
    pro: "Advanced (30 & 90-day history)",
  },
  {
    name: "Custom Domain",
    free: false,
    pro: true,
  },
  {
    name: "Google Analytics Integration",
    free: false,
    pro: true,
  },
  {
    name: "Priority Support",
    free: false,
    pro: true,
  },
];
