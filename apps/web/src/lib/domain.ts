import {
  ONELINK_LANDING,
  ONELINK_APP,
  ONELINK_APP_DEV,
  LOCALHOST_PORT_DEV,
  LOCALHOST_PORT_ALT,
} from "./constants";

/**
 * Check if we're on the app domain (app.getonelink.io)
 * This is where authenticated routes (dashboard, settings) should be accessed
 */
export function isAppDomain(host: string): boolean {
  const lower = host.toLowerCase();
  return (
    lower === ONELINK_APP ||
    lower.endsWith(`.${ONELINK_APP}`) ||
    // For localhost/dev, treat as app domain
    lower === "localhost" ||
    lower === `localhost:${LOCALHOST_PORT_DEV}` ||
    lower === `localhost:${LOCALHOST_PORT_ALT}` ||
    lower.endsWith(ONELINK_APP_DEV)
  );
}

/**
 * Check if we're on the landing domain (getonelink.io)
 * This is where profiles should be accessed
 */
export function isLandingDomain(host: string): boolean {
  const lower = host.toLowerCase();
  return lower === ONELINK_LANDING || lower.endsWith(`.${ONELINK_LANDING}`);
}

/**
 * Check if host is a base host (for profiles)
 * Profiles can be accessed on both landing domain and app domain
 */
export function isBaseHost(host: string): boolean {
  // Treat app base like getonelink.app, app.getonelink.io, getonelink.io or localhost as base host
  const lower = host.toLowerCase();
  return (
    lower === "localhost" ||
    lower === `localhost:${LOCALHOST_PORT_DEV}` ||
    lower === `localhost:${LOCALHOST_PORT_ALT}` ||
    lower.endsWith(ONELINK_APP_DEV) ||
    lower === ONELINK_APP ||
    lower.endsWith(`.${ONELINK_APP}`) ||
    lower === ONELINK_LANDING ||
    lower.endsWith(`.${ONELINK_LANDING}`)
  );
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
