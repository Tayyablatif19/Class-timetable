import React from "react";
import "./BadgeCard.css";

export default function BadgeCard({ icon = "🏅", name, description, earnedAt }) {
  return (
    <div className="badge-card">
      <div className="badge-icon">{icon}</div>

      <div className="badge-info">
        <h3 className="badge-name">{name}</h3>
        {description && <p className="badge-desc">{description}</p>}
        {earnedAt && (
          <p className="badge-date">
            Earned: {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
