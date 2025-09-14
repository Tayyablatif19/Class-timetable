import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Navbar.css";

export default function Navbar({ user, selectedDate, setSelectedDate }) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const path = location.pathname;

  const showCalendar = path === "/dashboard";

  let firstButtonLabel = "";
  let firstButtonAction = null;

  if (path === "/dashboard") {
    firstButtonLabel = "🏆";
    firstButtonAction = () => navigate("/leaderboard", { state: { user } });
  } else if (path === "/leaderboard" || path === "/birthdays") {
    firstButtonLabel = "Home";
    firstButtonAction = () => navigate("/dashboard");
  }

  const secondButtonLabel =
    path === "/dashboard" ? "🎂" : path === "/leaderboard" ? "🎂" : "🏆";
  const secondButtonAction =
    path === "/dashboard"
      ? () => navigate("/birthdays")
      : path === "/leaderboard"
      ? () => navigate("/birthdays")
      : () => navigate("/leaderboard", { state: { user } });

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="nav-btn" onClick={firstButtonAction}>
          {firstButtonLabel}
        </button>

        <button className="nav-btn" onClick={secondButtonAction}>
          {secondButtonLabel}
        </button>

        {showCalendar && (
          <>
            <button
              className="calendar-btn"
              onClick={() => setCalendarOpen((prev) => !prev)}
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
                maxDate={new Date()}
                inline
              />
            )}
          </>
        )}
      </div>

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
