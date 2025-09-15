import { supabase } from "./supabaseClient";

/**
 * Checks XP and other badges for a user and awards them if not earned.
 * @param {string} userId - Supabase user ID
 * @param {number} currentXP - User's current XP
 */
export async function checkAndAwardXPBadges(userId, currentXP = 0) {
  if (!userId) return;

  // 1️⃣ Define all badges
  const badges = [
    { key: "xp_50", type: "xp", threshold: 50 },
    { key: "xp_250", type: "xp", threshold: 250 },
    { key: "xp_500", type: "xp", threshold: 500 },
    { key: "xp_750", type: "xp", threshold: 750 },
    { key: "classes_day", type: "custom" },
    { key: "first_login", type: "custom" },
    { key: "login_3_days", type: "custom" },
    { key: "login_7_days", type: "custom" },
    { key: "classes_week", type: "custom" },
    { key: "birthday", type: "custom" },
  ];

  // 2️⃣ Get already earned badges
  const { data: earned, error } = await supabase
    .from("user_badges")
    .select("badge_id, badge_definitions!inner(key)")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch earned badges:", error.message);
    return;
  }

  const earnedKeys = earned?.map(e => e.badge_definitions.key) || [];
  const newlyAwarded = [];

  // 3️⃣ Iterate badges and award if eligible
  for (const badge of badges) {
    if (earnedKeys.includes(badge.key)) continue; // already earned

    let shouldAward = false;

    // XP-based badges
    if (badge.type === "xp" && currentXP >= badge.threshold) {
      shouldAward = true;
    }

    // Custom badges (placeholders, replace logic as needed)
    if (badge.type === "custom") {
      switch (badge.key) {
        case "first_login":
          // Example: first login badge
          shouldAward = true; // award immediately for testing
          break;
        case "classes_day":
        case "classes_week":
        case "login_3_days":
        case "login_7_days":
        case "birthday":
          // You can add real logic later (attendance, consecutive logins, date check)
          shouldAward = false; // default: do not award automatically
          break;
        default:
          break;
      }
    }

    if (shouldAward) {
      // Fetch badge definition ID
      const { data: badgeDef, error: badgeError } = await supabase
        .from("badge_definitions")
        .select("id")
        .eq("key", badge.key)
        .maybeSingle();

      if (badgeError || !badgeDef) {
        console.error(`Badge definition not found for key: ${badge.key}`);
        continue;
      }

      // Insert into user_badges
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

