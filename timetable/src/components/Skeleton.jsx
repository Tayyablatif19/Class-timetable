import React from "react";
import "./Skeleton.css";

export default function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", style }) {
  return <div className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}


