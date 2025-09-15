import { supabase } from "./supabaseClient";

/**
 * Checks XP-related badges and awards them if not already earned.
 * Call this function after XP is updated or fetched.
 * @param {string} userId - Current user's ID from Supabase auth.
 * @param {number} currentXP - The user's current XP value.
 */
export async function checkAndAwardXPBadges(userId, currentXP) {
  if (!userId || currentXP == null) return;

  // 1. Define XP badge thresholds
  const xpBadges = [
    { key: "xp_50", threshold: 50 },
    { key: "xp_250", threshold: 250 },
    { key: "xp_500", threshold: 500 },
    { key: "xp_750", threshold: 750 },
  ];

  // 2. Fetch earned badges for this user (join to get badge keys + ids)
  const { data: earned, error } = await supabase
    .from("user_badges")
    .select("badge_id, badge_definitions!inner(key)")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch earned badges:", error.message);
    return;
  }

  const earnedKeys = earned?.map((e) => e.badge_definitions.key) || [];

  // 3. For each XP badge, see if user qualifies and hasn't earned it yet
  for (const badge of xpBadges) {
    if (currentXP >= badge.threshold && !earnedKeys.includes(badge.key)) {
      // First fetch the badge_definitions row to get the actual UUID id
      const { data: badgeDef, error: badgeError } = await supabase
        .from("badge_definitions")
        .select("id")
        .eq("key", badge.key)
        .maybeSingle();

      if (badgeError || !badgeDef) {
        console.error(`Badge definition not found for key: ${badge.key}`);
        continue;
      }

      // Now insert into user_badges with badge_id (UUID)
      const { error: insertError } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeDef.id,
          earned_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Failed to insert badge ${badge.key}:`, insertError.message);
      } else {
        console.log(`✅ Badge ${badge.key} awarded!`);
      }
    }
  }
}
