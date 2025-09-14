import React from "react";
import "./ClassCard.css";

export default function ClassCard({ classData, onAttend, onAbsent, attendance }) {
  return (
    <div className="class-card">
      <div className="class-info">
        <h3 className="class-subject">{classData.subject}</h3>
        <p className="class-code">{classData.code}</p>
        <p className="class-time">{classData.time}</p>
        <p className="class-room">Room: {classData.room}</p>
        <p className="class-instructor">Instructor: {classData.instructor}</p>
      </div>

      <div className="class-actions">
        <button
          onClick={() => onAttend(classData.id)}
          className={`attend-btn${attendance === "present" ? " active" : ""}`}
          disabled={attendance === "present"}
        >
          {attendance === "present" ? "Present" : "Present"}
        </button>
        <button
          onClick={() => onAbsent(classData.id)}
          className={`absent-btn${attendance === "absent" ? " active" : ""}`}
          disabled={attendance === "absent"}
        >
          {attendance === "absent" ? "Absent" : "Absent"}
        </button>
      </div>
      {attendance && (
        <div className="attendance-status">
          Status: <strong>{attendance === "present" ? "Present" : "Absent"}</strong>
        </div>
      )}
    </div>
  );
}
