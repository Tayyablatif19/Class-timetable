import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { timetable } from "../utils/timetable";
import Navbar from "../components/Navbar";
import XPBar from "../components/XPBar";
import ClassCard from "../components/ClassCard";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [monthAttendance, setMonthAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error || !currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUser.email)
        .single();

      if (userError || !userData) {
        console.error("User info not found in database");
        navigate("/login", { replace: true });
        return;
      }

      setUser(userData);
    }

    fetchUser();
  }, [navigate]);

  // Fetch classes and attendance for selectedDate
  useEffect(() => {
    if (!user) return;

    async function fetchAttendance() {
      setLoading(true);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[selectedDate.getDay()];
      const classesToday = timetable[dayName] || [];
      setTodayClasses(classesToday);

      // Safe initialization
      const initialAttendance = {};
      classesToday.forEach(cls => {
        initialAttendance[cls.id] = null;
      });

      const dateStr = selectedDate.toISOString().split("T")[0];

      const { data: todayData } = await supabase
        .from("attendance")
        .select("class_id, status")
        .eq("reg_id", user.reg_id)
        .eq("date", dateStr);

      todayData?.forEach(row => {
        initialAttendance[row.class_id] = row.status;
      });

      setAttendance(initialAttendance);

      // Fetch month attendance for XP
      const monthStart = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-01`;
      const nextMonth = selectedDate.getMonth() === 11 ? 0 : selectedDate.getMonth() + 1;
      const nextMonthYear = selectedDate.getMonth() === 11 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear();
      const monthEnd = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;

      const { data: monthData } = await supabase
        .from("attendance")
        .select("class_id, status, date")
        .eq("reg_id", user.reg_id)
        .gte("date", monthStart)
        .lt("date", monthEnd);

      setMonthAttendance(monthData || []);
      setLoading(false);
    }

    fetchAttendance();
  }, [user, selectedDate]);

  // Calculate XP for month
  const calculateMonthlyXP = () => {
    return monthAttendance.reduce((xp, row) => {
      if (row.status === "present") return xp + 10;
      if (row.status === "absent") return xp - 5;
      return xp;
    }, 0);
  };

  const getTotalPossibleXP = () => {
    let total = 0;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth - 1, d);
      const dayName = days[dateObj.getDay()];
      total += (timetable[dayName] || []).length;
    }
    return total * 10;
  };

  const monthlyXP = calculateMonthlyXP();
  const totalMonthlyXP = getTotalPossibleXP();

  // Update attendance for a class
  const handleAttendanceUpdate = async (classId, status) => {
    const dateStr = selectedDate.toISOString().split("T")[0];

    setAttendance(prev => ({ ...prev, [classId]: status }));

    if (!user?.reg_id) return;

    const { error } = await supabase
      .from("attendance")
      .upsert([{
        reg_id: user.reg_id,
        class_id: classId,
        date: dateStr,
        status
      }], { onConflict: ["reg_id", "class_id", "date"] });

    if (error) {
      console.error("Failed to update attendance:", error);
      return;
    }

    setMonthAttendance(prev => {
      const filtered = prev.filter(row => !(row.class_id === classId && row.date === dateStr));
      return [...filtered, { reg_id: user.reg_id, class_id: classId, date: dateStr, status }];
    });
  };

  if (!user || loading) return <p className="dashboard-loading">Loading...</p>;

  return (
    <div className="dashboard-container">
      <Navbar user={user} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <h1 className="dashboard-title">
        Welcome, {user.name.charAt(0).toUpperCase() + user.name.slice(1)}.
      </h1>

      <p className="dashboard-subtitle">Classes for {selectedDate.toDateString()}</p>

      <XPBar currentXP={monthlyXP} totalXP={totalMonthlyXP} />

      {todayClasses.length > 0 ? (
        todayClasses.map(cls => (
          <ClassCard
            key={cls.id}
            classData={cls}
            onAttend={() => handleAttendanceUpdate(cls.id, "present")}
            onAbsent={() => handleAttendanceUpdate(cls.id, "absent")}
            attendance={attendance[cls.id]}
          />
        ))
      ) : (
        <p className="no-classes">No classes on this day</p>
      )}
    </div>
  );
}
