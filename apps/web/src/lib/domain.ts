import {
  ONELINK_LANDING,
  ONELINK_APP,
  ONELINK_APP_DEV,
  LOCALHOST_PORT_DEV,
  LOCALHOST_PORT_ALT,
} from "./constants";

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
