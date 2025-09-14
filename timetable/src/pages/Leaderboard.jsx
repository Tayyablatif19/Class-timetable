import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [usersXP, setUsersXP] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);

      // Current month
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const monthEnd = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;

      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("reg_id, name");

      if (usersError || !users) {
        console.error(usersError);
        setUsersXP([]);
        setLoading(false);
        return;
      }

      // Fetch attendance for all users in current month
      const { data: attendance, error: attError } = await supabase
        .from("attendance")
        .select("reg_id, status")
        .gte("date", monthStart)
        .lt("date", monthEnd);

      if (attError) {
        console.error(attError);
        setUsersXP([]);
        setLoading(false);
        return;
      }

      // Aggregate XP per user
      const xpMap = {};
      users.forEach(user => {
        xpMap[user.reg_id] = { reg_id: user.reg_id, name: user.name, xp: 0 };
      });

      attendance.forEach(record => {
        if (!xpMap[record.reg_id]) return;
        if (record.status === "present") xpMap[record.reg_id].xp += 10;
        else if (record.status === "absent") xpMap[record.reg_id].xp -= 5;
      });

      // Convert to array and sort
      const sorted = Object.values(xpMap).sort((a, b) => b.xp - a.xp);

      setUsersXP(sorted);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      
      <h2 className="leaderboard-title">Leaderboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Registration ID</th>
              <th>XP (This Month)</th>
            </tr>
          </thead>
          <tbody>
            {usersXP.map((user, idx) => (
              <tr key={user.reg_id} className={idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : ""}>
                <td>{idx + 1}</td>
                <td>{user.name}</td>
                <td>{user.reg_id}</td>
                <td>{user.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
