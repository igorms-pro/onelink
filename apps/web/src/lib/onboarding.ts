const ONBOARDING_KEY = "onelink_onboarding_completed";

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) !== "true";
}

export function setOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function setOnboardingIncomplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_KEY);
}
