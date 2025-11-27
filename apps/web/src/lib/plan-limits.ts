/**
 * Plan limits - Re-export from centralized plan config
 *
 * This file exists for backward compatibility.
 * New code should import directly from @/lib/types/plan
 */

import {
  PLANS,
  PlanId,
  getLinksLimit,
  getDropsLimit,
  type PlanTypeValue,
} from "./types/plan";

// Legacy constants (for backward compatibility)
export const FREE_PLAN_LINKS_LIMIT = PLANS[PlanId.FREE].limits.links;
export const FREE_PLAN_DROPS_LIMIT = PLANS[PlanId.FREE].limits.drops;

/**
 * Get links limit for a given plan
 * @deprecated Use getLinksLimit from @/lib/types/plan instead
 */
export function getPlanLinksLimit(plan: PlanTypeValue): number {
  const limit = getLinksLimit(plan);
  return limit === -1 ? Infinity : limit;
}

/**
 * Get drops limit for a given plan
 * @deprecated Use getDropsLimit from @/lib/types/plan instead
 */
export function getPlanDropsLimit(plan: PlanTypeValue): number {
  const limit = getDropsLimit(plan);
  return limit === -1 ? Infinity : limit;
}

/**
 * Get free plan links limit
 * @deprecated Use PLANS[PlanId.FREE].limits.links instead
 */
export function getFreeLinksLimit(): number {
  return FREE_PLAN_LINKS_LIMIT;
}

/**
 * Get free plan drops limit
 * @deprecated Use PLANS[PlanId.FREE].limits.drops instead
 */
export function getFreeDropsLimit(): number {
  return FREE_PLAN_DROPS_LIMIT;
}
