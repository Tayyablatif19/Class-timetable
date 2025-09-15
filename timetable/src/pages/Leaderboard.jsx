import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import "./Leaderboard.css";
import Skeleton from "../components/Skeleton";

export default function Leaderboard({ selectedDate, setSelectedDate }) {
  const [usersXP, setUsersXP] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch current user from Supabase auth
  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } = {}, error } = await supabase.auth.getUser();
      if (!currentUser || error) return;
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUser.email)
        .single();
      setUser(userData || null);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const monthEnd = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("reg_id, name");

      if (usersError || !users) {
        console.error(usersError);
        setUsersXP([]);
        setLoading(false);
        return;
      }

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

      const xpMap = {};
      users.forEach((u) => (xpMap[u.reg_id] = { reg_id: u.reg_id, name: u.name, xp: 0 }));

      attendance.forEach((record) => {
        if (!xpMap[record.reg_id]) return;
        if (record.status === "present") xpMap[record.reg_id].xp += 10;
        else if (record.status === "absent") xpMap[record.reg_id].xp -= 5;
      });

      const sorted = Object.values(xpMap).sort((a, b) => b.xp - a.xp);

      setUsersXP(sorted);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      {user && (
        <Navbar user={user} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

      <h2 className="leaderboard-title">Leaderboard</h2>
      {loading ? (
        <div className="leaderboard-container">
          <Skeleton height="32px" width="40%" style={{ marginBottom: "20px" }} />
          {[...Array(5)].map((_, idx) => (
            <Skeleton key={idx} height="24px" width="100%" style={{ marginBottom: "12px" }} />
          ))}
        </div>
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
              <tr
                key={user.reg_id}
                className={
                  idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : ""
                }
              >
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


