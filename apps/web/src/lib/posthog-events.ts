import { trackEvent, identifyUser, resetUser } from "./posthog";

/**
 * PostHog event tracking helpers
 * Centralized event names and tracking functions for consistency
 */

// User Lifecycle Events
export function trackUserSignedUp(userId: string) {
  identifyUser(userId, {
    // Don't include email in properties (privacy)
    signed_up_at: new Date().toISOString(),
  });
  trackEvent("user_signed_up", {
    user_id: userId,
  });
}

export function trackUserSignedIn(userId: string) {
  identifyUser(userId);
  trackEvent("user_signed_in", {
    user_id: userId,
  });
}

export function trackUserSignedOut() {
  trackEvent("user_signed_out");
  resetUser();
}

export function trackUserDeletedAccount(userId: string) {
  trackEvent("user_deleted_account", {
    user_id: userId,
  });
  resetUser();
}

// Profile Actions
export function trackProfileCreated(userId: string, profileSlug: string) {
  trackEvent("profile_created", {
    user_id: userId,
    profile_slug: profileSlug,
  });
}

export function trackProfileViewed(profileSlug: string, isOwner: boolean) {
  trackEvent("profile_viewed", {
    profile_slug: profileSlug,
    is_owner: isOwner,
  });
}

export function trackProfileUpdated(userId: string) {
  trackEvent("profile_updated", {
    user_id: userId,
  });
}

// Link Actions
export function trackLinkCreated(userId: string, linkId: string) {
  trackEvent("link_created", {
    user_id: userId,
    link_id: linkId,
  });
}

export function trackLinkUpdated(userId: string, linkId: string) {
  trackEvent("link_updated", {
    user_id: userId,
    link_id: linkId,
  });
}

export function trackLinkDeleted(userId: string, linkId: string) {
  trackEvent("link_deleted", {
    user_id: userId,
    link_id: linkId,
  });
}

export function trackLinkClicked(linkId: string, profileSlug: string) {
  trackEvent("link_clicked", {
    link_id: linkId,
    profile_slug: profileSlug,
  });
}

// Drop Actions
export function trackDropCreated(userId: string, dropId: string) {
  trackEvent("drop_created", {
    user_id: userId,
    drop_id: dropId,
  });
}

export function trackDropUpdated(userId: string, dropId: string) {
  trackEvent("drop_updated", {
    user_id: userId,
    drop_id: dropId,
  });
}

export function trackDropDeleted(userId: string, dropId: string) {
  trackEvent("drop_deleted", {
    user_id: userId,
    drop_id: dropId,
  });
}

export function trackDropViewed(dropToken: string, isOwner: boolean) {
  trackEvent("drop_viewed", {
    drop_token: dropToken,
    is_owner: isOwner,
  });
}

export function trackSubmissionReceived(dropId: string, userId?: string) {
  trackEvent("submission_received", {
    drop_id: dropId,
    ...(userId && { user_id: userId }),
  });
}

// Billing Events
export function trackSubscriptionUpgraded(userId: string, plan: string) {
  trackEvent("subscription_upgraded", {
    user_id: userId,
    plan,
  });
}

export function trackSubscriptionDowngraded(userId: string, plan: string) {
  trackEvent("subscription_downgraded", {
    user_id: userId,
    plan,
  });
}
