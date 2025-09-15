import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import BadgeCard from "../components/BadgeCard";
import "./Badges.css";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      try {
        // 1. Fetch badge definitions
        const { data: defs, error: defsError } = await supabase
          .from("badge_definitions")
          .select("*")
          .order("display_order");

        if (defsError) throw defsError;

        // 2. Get logged-in user
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        // 3. Fetch unlocked badges (if user logged in)
        let unlocked = [];
        if (user) {
          const { data: unlockedRows, error: ubError } = await supabase
            .from("user_badges")
            .select("*")
            .eq("user_id", user.id);

          if (ubError) throw ubError;
          unlocked = unlockedRows;
        }

        // 4. Merge unlocked info
        const merged = defs.map((badge) => {
          const match = unlocked.find(
            (u) => u.badge_key === badge.key || u.badge_id === badge.id
          );
          return { ...badge, earned_at: match?.earned_at || null };
        });

        setBadges(merged);
      } catch (err) {
        console.error("Failed to fetch badges:", err);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, []);

  return (
    <div className="badges-page">
      <h1 className="badges-title">Your Badges</h1>

      {loading ? (
        <p className="loading-text">Loading badges...</p>
      ) : (
        <div className="badges-grid">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              icon={badge.icon}
              name={badge.name}
              description={badge.description}
              earnedAt={badge.earned_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
