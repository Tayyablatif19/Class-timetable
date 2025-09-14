import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import "./Birthdays.css";
import Skeleton from "../components/Skeleton";

export default function Birthdays({ selectedDate, setSelectedDate }) {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
    async function fetchBirthdays() {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("name, dob");

      if (error || !data) {
        console.error(error);
        setBirthdays([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;

      const monthBirthdays = data
        .filter((u) => u.dob)
        .map((u) => {
          const dobDate = new Date(u.dob);
          if (dobDate.getMonth() + 1 === currentMonth) {
            const birthdayThisYear = new Date(
              now.getFullYear(),
              dobDate.getMonth(),
              dobDate.getDate()
            );
            const timeDiff = birthdayThisYear - now;
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return {
              name: u.name,
              day: dobDate.getDate(),
              month: dobDate.getMonth() + 1,
              daysLeft: daysLeft >= 0 ? daysLeft : 0,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setBirthdays(monthBirthdays);
      setLoading(false);
    }

    fetchBirthdays();
  }, []);

  return (
    <div className="birthdays-container">
      {user && (
        <Navbar user={user} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

      <h2 className="birthdays-title">Birthdays This Month</h2>

      {loading ? (
        <div className="birthdays-container">
          <Skeleton height="32px" width="50%" style={{ marginBottom: "20px" }} />
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} height="24px" width="100%" style={{ marginBottom: "12px" }} />
          ))}
        </div>
      ) : birthdays.length === 0 ? (
        <div className="no-birthdays-card">No birthdays this month 🎉</div>
      ) : (
        <table className="birthdays-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Birthday</th>
              <th>Days Left</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.map((b, idx) => (
              <tr key={idx}>
                <td>{b.name}</td>
                <td>{`${b.day}/${b.month}`}</td>
                <td>{b.daysLeft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
