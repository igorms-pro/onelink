/**
 * Helper functions to create test data for E2E tests
 * Creates drops, submissions, and other test data needed for notifications tests
 */

import { createClient } from "@supabase/supabase-js";

// @ts-expect-error - process.env is available in Node.js environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
// @ts-expect-error - process.env is available in Node.js environment
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Create test data for notifications tests
 * Creates a drop and unread submissions for the test user
 */
export async function createNotificationsTestData(
  userId: string,
): Promise<{ dropId: string; submissionIds: string[] }> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Step 1: Ensure users row exists first (getOrCreateProfile does this too)
  const { error: userError } = await supabaseAdmin.from("users").upsert(
    {
      id: userId,
      email: "", // Email not needed for test
    },
    { onConflict: "id" },
  );
  if (userError) {
    console.warn("Failed to ensure users row:", userError);
  }

  // Step 2: Get or create profile for test user
  let profileId: string;
  let profileSlug: string;

  const { data: existingProfile, error: _profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, slug")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingProfile) {
    profileId = existingProfile.id;
    profileSlug = existingProfile.slug;
  } else {
    // Create profile if it doesn't exist
    // Use timestamp + random to avoid collisions in parallel tests
    profileSlug = `testuser${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          user_id: userId,
          slug: profileSlug,
          display_name: "Test User",
        },
      ])
      .select("id")
      .single();

    if (createError) {
      // If duplicate key error, try to get the existing profile
      if (
        createError.message.includes("duplicate key") ||
        createError.code === "23505"
      ) {
        const { data: existingProfileAfterError } = await supabaseAdmin
          .from("profiles")
          .select("id, slug")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingProfileAfterError) {
          profileId = existingProfileAfterError.id;
          profileSlug = existingProfileAfterError.slug;
        } else {
          throw new Error(`Failed to create profile: ${createError.message}`);
        }
      } else {
        throw new Error(
          `Failed to create profile: ${createError.message || "Unknown error"}`,
        );
      }
    } else if (!newProfile) {
      throw new Error("Failed to create profile: No profile returned");
    } else {
      profileId = newProfile.id;
    }
  }

  // Step 3: Get or create a drop for this profile
  let dropId: string;

  const { data: existingDrop, error: _dropError } = await supabaseAdmin
    .from("drops")
    .select("id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (existingDrop) {
    dropId = existingDrop.id;
  } else {
    // Create a test drop
    const { data: newDrop, error: createDropError } = await supabaseAdmin
      .from("drops")
      .insert([
        {
          profile_id: profileId,
          label: "Test Drop for Notifications",
          is_public: true,
          max_file_size_mb: 50,
        },
      ])
      .select("id")
      .single();

    if (createDropError || !newDrop) {
      throw new Error(
        `Failed to create drop: ${createDropError?.message || "Unknown error"}`,
      );
    }

    dropId = newDrop.id;
  }

  // Step 4: Create unread submissions (these will show badges)
  const submissionIds: string[] = [];

  // Create 2-3 unread submissions
  for (let i = 0; i < 3; i++) {
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .insert([
        {
          drop_id: dropId,
          name: `Test Submitter ${i + 1}`,
          email: `test${i + 1}@example.com`,
          note: `Test submission ${i + 1} for notifications`,
          files: [], // No files needed for badge test
          read_at: null, // Unread = no read_at timestamp
        },
      ])
      .select("id")
      .single();

    if (!submissionError && submission) {
      submissionIds.push(submission.id);
    }
  }

  return { dropId, submissionIds };
}

/**
 * Clean up test data (optional - for test cleanup)
 */
export async function cleanupNotificationsTestData(
  userId: string,
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Get profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return;

  // Get drops
  const { data: drops } = await supabaseAdmin
    .from("drops")
    .select("id")
    .eq("profile_id", profile.id);

  if (!drops || drops.length === 0) return;

  const dropIds = drops.map((d) => d.id);

  // Delete submissions
  await supabaseAdmin.from("submissions").delete().in("drop_id", dropIds);

  // Optionally delete drops too (uncomment if needed)
  // await supabaseAdmin
  //   .from("drops")
  //   .delete()
  //   .eq("profile_id", profile.id);
}
