import { PlanType } from "./types/plan";
import type { PlanTypeValue } from "./types/plan";

/**
 * Free plan limits (separate for links and drops)
 *
 * NOTE: Currently hardcoded, but can be easily migrated to DB later if needed.
 * To migrate: create a plan_limits table and fetch from DB here.
 */
export const FREE_PLAN_LINKS_LIMIT = 4;
export const FREE_PLAN_DROPS_LIMIT = 2;

/**
 * Get links limit for a given plan
 * @param plan - Plan type (PlanType enum or string)
 * @returns Limit number (4 for free, Infinity for pro/unlimited)
 *
 * Future: Can be modified to fetch from DB if dynamic limits are needed
 */
export function getPlanLinksLimit(plan: PlanTypeValue): number {
  if (plan === PlanType.PRO) {
    return Infinity;
  }
  return FREE_PLAN_LINKS_LIMIT;
}

/**
 * Get drops limit for a given plan
 * @param plan - Plan type (PlanType enum or string)
 * @returns Limit number (2 for free, Infinity for pro/unlimited)
 *
 * Future: Can be modified to fetch from DB if dynamic limits are needed
 */
export function getPlanDropsLimit(plan: PlanTypeValue): number {
  if (plan === PlanType.PRO) {
    return Infinity;
  }
  return FREE_PLAN_DROPS_LIMIT;
}

/**
 * Get free plan links limit
 * Convenience function to get the links limit for free plan
 * @returns Free plan links limit (4)
 */
export function getFreeLinksLimit(): number {
  return getPlanLinksLimit(PlanType.FREE);
}

/**
 * Get free plan drops limit
 * Convenience function to get the drops limit for free plan
 * @returns Free plan drops limit (2)
 */
export function getFreeDropsLimit(): number {
  return getPlanDropsLimit(PlanType.FREE);
}
