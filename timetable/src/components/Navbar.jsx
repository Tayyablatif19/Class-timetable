import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Navbar.css";

export default function Navbar({ user, selectedDate, setSelectedDate }) {
  const navigate = useNavigate();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <nav className="navbar">
      
      <div className="navbar-left">
        <h1 className="navbar-title"></h1>

        <button
          className="leaderboard-btn"
          onClick={() => navigate("/leaderboard", { state: { user } })}
        >
          Leaderboard
        </button>

        <button
          className="birthday-btn"
          onClick={() => navigate("/birthdays")}
        >
          🎂
        </button>

        {/* Calendar Emoji */}
        <button
          className="calendar-btn"
          onClick={() => setCalendarOpen(prev => !prev)}
        >
          📅
        </button>

        {calendarOpen && (
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setCalendarOpen(false);
            }}
            minDate={new Date(2025, 8, 8)} // Sept 8, 2025
            maxDate={new Date()} // cannot pick future dates
            inline
          />
        )}
      </div>

      {/* Right Side - Date + User Info + Logout */}
      <div className="navbar-right">
        <span className="navbar-date">{today}</span>
        <span className="navbar-user">{user?.name || "Student"}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
