/**
 * Plan System - Centralized plan definitions
 *
 * Architecture:
 * - All plan metadata is defined here (no if/else scattered in code)
 * - Plans are extensible (just add to PLANS object)
 * - Type-safe with autocomplete
 */

// Plan identifiers (stored in DB)
export const PlanId = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro",
} as const;

export type PlanId = (typeof PlanId)[keyof typeof PlanId];

// For backward compatibility
export const PlanType = PlanId;
export type PlanType = PlanId;
export type PlanTypeValue = PlanId | string;

/**
 * Plan metadata definition
 */
export interface PlanConfig {
  id: PlanId;
  name: string;
  tier: number; // 0 = free, 1 = starter, 2 = pro (for comparisons)
  limits: {
    links: number; // -1 = unlimited
    drops: number; // -1 = unlimited
    maxFileSize: number; // in MB
    fileRetentionDays: number;
  };
  features: {
    customDomain: boolean;
    analytics: "basic" | "advanced";
    analyticsHistoryDays: number;
    googleAnalytics: boolean;
    prioritySupport: boolean;
    customThemes: boolean;
  };
}

/**
 * All plans configuration - Single source of truth
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  [PlanId.FREE]: {
    id: PlanId.FREE,
    name: "Free",
    tier: 0,
    limits: {
      links: 4,
      drops: 2,
      maxFileSize: 50,
      fileRetentionDays: 7,
    },
    features: {
      customDomain: false,
      analytics: "basic",
      analyticsHistoryDays: 7,
      googleAnalytics: false,
      prioritySupport: false,
      customThemes: true,
    },
  },
  [PlanId.STARTER]: {
    id: PlanId.STARTER,
    name: "Starter",
    tier: 1,
    limits: {
      links: -1, // unlimited
      drops: -1, // unlimited
      maxFileSize: 500,
      fileRetentionDays: 30,
    },
    features: {
      customDomain: true,
      analytics: "basic",
      analyticsHistoryDays: 7,
      googleAnalytics: false,
      prioritySupport: false,
      customThemes: true,
    },
  },
  [PlanId.PRO]: {
    id: PlanId.PRO,
    name: "Pro",
    tier: 2,
    limits: {
      links: -1, // unlimited
      drops: -1, // unlimited
      maxFileSize: 2048, // 2GB
      fileRetentionDays: 90,
    },
    features: {
      customDomain: true,
      analytics: "advanced",
      analyticsHistoryDays: 90,
      googleAnalytics: true,
      prioritySupport: true,
      customThemes: true,
    },
  },
};

/**
 * Get plan configuration by ID
 */
export function getPlan(planId: PlanTypeValue | null | undefined): PlanConfig {
  if (!planId || !(planId in PLANS)) {
    return PLANS[PlanId.FREE];
  }
  return PLANS[planId as PlanId];
}

/**
 * Get plan name for display
 */
export function getPlanName(planId: PlanTypeValue | null | undefined): string {
  return getPlan(planId).name;
}

/**
 * Get default plan (Free)
 */
export function getDefaultPlan(): typeof PlanId.FREE {
  return PlanId.FREE;
}

/**
 * Check if plan is at least a certain tier
 */
export function isPlanAtLeast(
  planId: PlanTypeValue | null | undefined,
  minimumPlanId: PlanId,
): boolean {
  const plan = getPlan(planId);
  const minimumPlan = PLANS[minimumPlanId];
  return plan.tier >= minimumPlan.tier;
}

/**
 * Check if plan is Pro
 */
export function isProPlan(planId: PlanTypeValue | null | undefined): boolean {
  return getPlan(planId).id === PlanId.PRO;
}

/**
 * Check if plan is Free
 */
export function isFreePlan(planId: PlanTypeValue | null | undefined): boolean {
  return getPlan(planId).id === PlanId.FREE;
}

/**
 * Check if plan is paid (not free)
 */
export function isPaidPlan(planId: PlanTypeValue | null | undefined): boolean {
  return getPlan(planId).tier > 0;
}

/**
 * Get links limit for a plan (-1 = unlimited)
 */
export function getLinksLimit(
  planId: PlanTypeValue | null | undefined,
): number {
  return getPlan(planId).limits.links;
}

/**
 * Get drops limit for a plan (-1 = unlimited)
 */
export function getDropsLimit(
  planId: PlanTypeValue | null | undefined,
): number {
  return getPlan(planId).limits.drops;
}

/**
 * Check if user can add more links
 */
export function canAddLink(
  planId: PlanTypeValue | null | undefined,
  currentCount: number,
): boolean {
  const limit = getLinksLimit(planId);
  return limit === -1 || currentCount < limit;
}

/**
 * Check if user can add more drops
 */
export function canAddDrop(
  planId: PlanTypeValue | null | undefined,
  currentCount: number,
): boolean {
  const limit = getDropsLimit(planId);
  return limit === -1 || currentCount < limit;
}

/**
 * Check if plan has a specific feature
 */
export function hasFeature(
  planId: PlanTypeValue | null | undefined,
  feature: keyof PlanConfig["features"],
): boolean {
  const plan = getPlan(planId);
  const value = plan.features[feature];
  return typeof value === "boolean" ? value : !!value;
}

/**
 * Get all plan IDs in order of tier
 */
export function getAllPlanIds(): PlanId[] {
  return Object.values(PlanId).sort((a, b) => PLANS[a].tier - PLANS[b].tier);
}
