import React, { useEffect, useState } from "react";
import "./XPBar.css";

export default function XPBar({ currentXP, totalXP }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = totalXP > 0 ? (currentXP / totalXP) * 100 : 0;
    const timeout = setTimeout(() => setProgress(percentage), 50);
    return () => clearTimeout(timeout);
  }, [currentXP, totalXP]);

  return (
    <div
      className="xp-bar-container"
      data-text={`${currentXP}/${totalXP} XP`} // always shows text over bar
    >
      <div className="xp-bar-fill" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
