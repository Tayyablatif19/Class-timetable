import React from "react";
import "./BadgeCard.css";

export default function BadgeCard({ icon, name, description, earnedAt }) {
  const statusClass = earnedAt ? "unlocked" : "locked";

  return (
    <div className={`badge-card ${statusClass}`}>
      <div className="badge-icon">
        {icon ? (
          <img src={icon} alt={name} />
        ) : (
          <span style={{ fontSize: "2rem" }}>🏅</span>
        )}
      </div>
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

