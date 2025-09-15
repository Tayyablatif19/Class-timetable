import { supabase } from "./supabaseClient";

export async function checkAndAwardXPBadges(userId, currentXP) {
  if (!userId || currentXP == null) return [];

  const xpBadges = [
    { key: "xp_50", threshold: 50 },
    { key: "xp_250", threshold: 250 },
    { key: "xp_500", threshold: 500 },
    { key: "xp_750", threshold: 750 },
  ];

  // Fetch earned badges
  const { data: earned, error } = await supabase
    .from("user_badges")
    .select("badge_id, badge_definitions!inner(key)")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch earned badges:", error.message);
    return [];
  }

  const earnedKeys = earned?.map(e => e.badge_definitions.key) || [];
  const newlyAwarded = [];

  for (const badge of xpBadges) {
    if (currentXP >= badge.threshold && !earnedKeys.includes(badge.key)) {
      const { data: badgeDef, error: badgeError } = await supabase
        .from("badge_definitions")
        .select("id")
        .eq("key", badge.key)
        .maybeSingle();

      if (badgeError || !badgeDef) {
        console.error(`Badge definition not found for key: ${badge.key}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeDef.id,
          earned_at: new Date().toISOString(),
        });

      if (insertError) console.error(`Failed to insert badge ${badge.key}:`, insertError.message);
      else {
        console.log(`✅ Badge ${badge.key} awarded!`);
        newlyAwarded.push(badge.key);
      }
    }
  }

  return newlyAwarded;
}


