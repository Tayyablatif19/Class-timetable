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
        const { data, error } = await supabase.from("badges").select("*");
        if (error) {
          console.error("Supabase error:", error);
          setBadges([]);
        } else {
          setBadges(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
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
      ) : badges.length === 0 ? (
        <p className="no-badges">You have no badges yet. Start participating to earn some!</p>
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
