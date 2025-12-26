import { Lock, Database, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TrustFeature {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

export const trustFeatures: TrustFeature[] = [
  {
    icon: Lock,
    titleKey: "landing.trust.encryption.title",
    descriptionKey: "landing.trust.encryption.description",
  },
  {
    icon: Database,
    titleKey: "landing.trust.hosting.title",
    descriptionKey: "landing.trust.hosting.description",
  },
  {
    icon: CheckCircle2,
    titleKey: "landing.trust.control.title",
    descriptionKey: "landing.trust.control.description",
  },
];
