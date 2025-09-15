// Badges.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import BadgeCard from "../components/BadgeCard";
import Navbar from "../components/Navbar";
import { checkAndAwardXPBadges } from "../utils/badges";
import Skeleton from "../components/Skeleton";
import "../components/BadgeCard.css";
import "../components/Skeleton.css";

import xp50 from "../assets/badges/xp_50.png";
import xp250 from "../assets/badges/xp_250.png";
import xp500 from "../assets/badges/xp_500.png";
import xp750 from "../assets/badges/xp_750.png";

import classesDay from "../assets/badges/classes_day.png";
import firstLogin from "../assets/badges/first_login.png";
import login3Days from "../assets/badges/login_3_days.png";
import login7Days from "../assets/badges/login_7_days.png";
import classesWeek from "../assets/badges/classes_week.png";
import birthday from "../assets/badges/birthday.png";

const badgeIcons = {
  xp_50: xp50,
  xp_250: xp250,
  xp_500: xp500,
  xp_750: xp750,
  classes_day: classesDay,
  first_login: firstLogin,
  login_3_days: login3Days,
  login_7_days: login7Days,
  classes_week: classesWeek,
  birthday: birthday,
};

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchBadges() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;
      if (!currentUser) throw new Error("No user logged in");
      setUser(currentUser);

      // Get user's XP
      const { data: userProfile } = await supabase
        .from("users")
        .select("xp")
        .eq("id", currentUser.id)
        .single();
      const currentXP = userProfile?.xp || 0;

      // Award eligible XP badges
      await checkAndAwardXPBadges(currentUser.id, currentXP);

      // Fetch badge definitions
      const { data: defs } = await supabase
        .from("badge_definitions")
        .select("*")
        .order("display_order");

      // Fetch user's earned badges
      const { data: unlockedRows } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", currentUser.id);

      // Merge badges with earned info
      const merged = defs.map((badge) => {
        const match = unlockedRows.find((u) => u.badge_id === badge.id);
        return {
          ...badge,
          earned_at: match?.earned_at || null,
          icon: badgeIcons[badge.key] || null,
        };
      });

      setBadges(merged);
    } catch (err) {
      console.error("Failed to fetch badges:", err.message);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBadges();
  }, []);

  return (
    <div className="badges-page">
      <Navbar user={user} />
      <h1 className="badges-title">Badges - work in progress</h1>

      <div className="badges-grid">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="badge-skeleton">
                <Skeleton width="50px" height="50px" borderRadius="50%" />
                <Skeleton width="40px" height="12px" style={{ marginTop: "4px" }} />
              </div>
            ))
          : badges.length > 0
          ? badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                icon={badge.icon}
                name={badge.name}
                description={badge.description}
                earnedAt={badge.earned_at}
              />
            ))
          : <p className="no-badges">No badges yet. Keep earning XP!</p>
        }
      </div>
    </div>
  );
}
