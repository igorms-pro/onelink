/**
 * Device detection utilities for session tracking
 */

export interface DeviceInfo {
  os: string;
  browser: string;
  userAgent: string;
}

/**
 * Detect OS from user agent
 */
function detectOS(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  return "Unknown";
}

/**
 * Detect browser from user agent
 */
function detectBrowser(userAgent: string): string {
  if (/Edg/i.test(userAgent)) return "Edge";
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return "Chrome";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return "Safari";
  if (/Opera|OPR/i.test(userAgent)) return "Opera";
  return "Unknown";
}

/**
 * Get device information from user agent
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return {
    os: detectOS(userAgent),
    browser: detectBrowser(userAgent),
    userAgent,
  };
}

/**
 * Get client IP address (requires external service)
 * Falls back to null if unavailable
 */
export async function getClientIP(): Promise<string | null> {
  try {
    // Use a free IP detection service
    const response = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.warn("Could not fetch client IP:", error);
    return null;
  }
}

/**
 * Get location info from IP (optional, requires external service)
 * Falls back to null if unavailable
 */
export async function getLocationFromIP(
  ip: string,
): Promise<{ city: string | null; country: string | null }> {
  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    return {
      city: data.city || null,
      country: data.country_name || data.country_code || null,
    };
  } catch (error) {
    console.warn("Could not fetch location from IP:", error);
    return { city: null, country: null };
  }
}
