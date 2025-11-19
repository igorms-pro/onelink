/**
 * Plan types constants
 * Centralized definition for all plan types in the application
 */
export const PlanType = {
  FREE: "free",
  PRO: "pro",
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];

/**
 * Type alias for plan type (allows enum or string for backward compatibility)
 */
export type PlanTypeValue = PlanType | string;

/**
 * Helper function to check if a plan is Pro
 */
export function isProPlan(plan: PlanTypeValue | null | undefined): boolean {
  return plan === PlanType.PRO;
}

/**
 * Helper function to check if a plan is Free
 */
export function isFreePlan(plan: PlanTypeValue | null | undefined): boolean {
  return plan === PlanType.FREE || !plan || plan !== PlanType.PRO;
}

/**
 * Helper function to get default plan (Free)
 */
export function getDefaultPlan(): typeof PlanType.FREE {
  return PlanType.FREE;
}
