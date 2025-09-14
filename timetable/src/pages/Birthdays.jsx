import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./Birthdays.css";

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBirthdays() {
      setLoading(true);

      // Fetch all users
      const { data, error } = await supabase
        .from("users")
        .select("name, dob");

      if (error) {
        console.error("Error fetching users:", error);
        setBirthdays([]);
      } else {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-based

        // Filter users with birthday in current month and calculate days left
        const monthBirthdays = data
          .filter(user => user.dob)
          .map(user => {
            const dobDate = new Date(user.dob);
            if (dobDate.getMonth() + 1 === currentMonth) {
              const birthdayThisYear = new Date(
                now.getFullYear(),
                dobDate.getMonth(),
                dobDate.getDate()
              );
              const timeDiff = birthdayThisYear - now;
              const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
              return {
                name: user.name,
                day: dobDate.getDate(),
                month: dobDate.getMonth() + 1,
                daysLeft: daysLeft >= 0 ? daysLeft : 0
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setBirthdays(monthBirthdays);
      }

      setLoading(false);
    }

    fetchBirthdays();
  }, []);

  return (
    <div className="birthdays-container">
      <h2 className="birthdays-title">Birthdays This Month</h2>
      {loading ? (
        <p>Loading...</p>
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
