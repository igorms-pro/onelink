/**
 * Session tracking utilities
 * Functions to create sessions and log login history
 */

import { supabase } from "@/lib/supabase";
import { getDeviceInfo, getLocationFromIP } from "@/lib/utils/deviceDetection";

export interface CreateSessionParams {
  userId: string;
  deviceOS?: string;
  deviceBrowser?: string;
  ipAddress?: string | null;
  city?: string | null;
  country?: string | null;
}

/**
 * Create a new user session in the database
 */
export async function createUserSession(
  params: CreateSessionParams,
): Promise<string | null> {
  try {
    const deviceInfo = getDeviceInfo();
    // Don't wait for IP - it can block. Use provided IP or skip
    const ip = params.ipAddress || null;
    let city = params.city;
    let country = params.country;

    // Skip IP location lookup - it can block and is not critical
    // If IP is available and location not provided, try to get it (but don't block)
    if (ip && !city && !country) {
      // Run location lookup in background, don't await
      getLocationFromIP(ip)
        .then((location) => {
          // Optionally update session later if needed
          city = location.city;
          country = location.country;
        })
        .catch(() => {
          // Ignore errors - location is not critical
        });
    }

    const { data, error } = await supabase
      .from("user_sessions")
      .insert({
        user_id: params.userId,
        device_os: params.deviceOS || deviceInfo.os,
        device_browser: params.deviceBrowser || deviceInfo.browser,
        ip_address: ip || null,
        city: city || null,
        country: country || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating user session:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error creating user session:", error);
    return null;
  }
}

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await supabase
      .from("user_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", sessionId);
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
}

export interface LogLoginAttemptParams {
  email: string;
  status: "success" | "failed";
  userId?: string | null;
  ipAddress?: string | null;
  deviceInfo?: string;
  userAgent?: string;
}

/**
 * Log a login attempt (success or failure) to login_history
 */
export async function logLoginAttempt(
  params: LogLoginAttemptParams,
): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo();
    // Don't wait for IP - use provided IP or skip to avoid blocking
    const ip = params.ipAddress || null;

    await supabase.from("login_history").insert({
      user_id: params.userId || null,
      email: params.email,
      status: params.status,
      ip_address: ip || null,
      device_info:
        params.deviceInfo || `${deviceInfo.browser} on ${deviceInfo.os}`,
      user_agent: params.userAgent || deviceInfo.userAgent,
    });
  } catch (error) {
    console.error("Error logging login attempt:", error);
    // Don't throw - login history is not critical
  }
}
