import { useEffect, useState } from "react";
import {
  getAttendance,
  loginAttendance,
  logoutAttendance,
} from "../api/services/attendanceService";
import jsPDF from "jspdf";
import "./attendance.css";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monthlyTotalHours, setMonthlyTotalHours] = useState(0);

  // Live Time Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAttendance();
      const allRecords = res.data.data || [];
      setRecords(allRecords);

      // Calculate Monthly Total Hours
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const totalHours = allRecords
        .filter((r) => {
          const date = new Date(r.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, item) => {
          const hours = parseFloat(item.working_hours) || 0;
          return sum + hours;
        }, 0);

      setMonthlyTotalHours(totalHours);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleLogin = async () => {
    try {
      await loginAttendance();
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start work");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAttendance();
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to end work");
    }
  };

  // Check if user is currently logged in
  const isLoggedIn = records.some((r) => !r.logout_time);

  const formatHours = (hours) => {
    if (!hours && hours !== 0) return "-";
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m > 0 ? m + "m" : ""}`;
  };

  // Group records by date
  const grouped = records.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  // Get Total Hours for a day
  const getTotalHours = (entries) => {
    return entries.reduce((sum, item) => {
      const hours = parseFloat(item.working_hours) || 0;
      return sum + hours;
    }, 0);
  };

  // Download Monthly PDF Report
  const downloadMonthlyReport = () => {
    const doc = new jsPDF();
    let y = 25;

    doc.setFontSize(20);
    doc.text(
      `ATTENDANCE REPORT - ${new Date().toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      })}`,
      105,
      y,
      { align: "center" }
    );
    y += 15;

    doc.setFontSize(12);
    doc.text(`Total Working Hours: ${monthlyTotalHours.toFixed(2)} hrs`, 20, y);
    y += 20;

    // Sort dates in descending order (newest first)
    Object.keys(grouped)
      .sort()
      .reverse()
      .forEach((date) => {
        if (y > 270) {
          doc.addPage();
          y = 25;
        }

        doc.setFontSize(14);
        doc.text(date, 20, y);
        y += 8;

        grouped[date].forEach((r) => {
          doc.setFontSize(11);
          doc.text(`Login: ${new Date(r.login_time).toLocaleTimeString()}`, 25, y);
          doc.text(
            `Logout: ${r.logout_time ? new Date(r.logout_time).toLocaleTimeString() : "Still Working"}`,
            100,
            y
          );
          doc.text(`Hours: ${formatHours(r.working_hours)}`, 160, y);
          y += 10;
        });
        y += 8;
      });

    doc.save(`Attendance_${new Date().toISOString().slice(0, 7)}.pdf`);
  };

  return (
    <div className="attendance-container">
      <div className="page-header">
        <div>
          <h1>⏰ Attendance Dashboard</h1>
          <p>Track your daily & monthly working hours</p>
        </div>
        <div className="live-time">
          {currentTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-bar">
        <button
          onClick={handleLogin}
          disabled={isLoggedIn}
          className="btn login-btn"
        >
          🟢 Start Work
        </button>
        <button
          onClick={handleLogout}
          disabled={!isLoggedIn}
          className="btn logout-btn"
        >
          🔴 End Work
        </button>
      </div>

      {/* Monthly Overview */}
      <div className="monthly-overview">
        <div className="overview-card">
          <h3>This Month Total Hours</h3>
          <h2>{monthlyTotalHours.toFixed(1)} hrs</h2>
          <button onClick={downloadMonthlyReport} className="btn-download">
            📥 Download Monthly Report
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading attendance records...</p>}

      {Object.keys(grouped).length === 0 && !loading && (
        <p className="no-records">No attendance records found</p>
      )}

      {/* Daily Records */}
      {Object.keys(grouped)
        .sort()
        .reverse()
        .map((date) => (
          <div key={date} className="date-card">
            <div className="date-header">
              <h2>
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <span className="total-hours">
                Total: {formatHours(getTotalHours(grouped[date]))}
              </span>
            </div>

            {grouped[date].map((r) => (
              <div key={r.id} className="entry-card">
                <div className="entry-row">
                  <div>
                    <span>Login</span>
                    <strong>{new Date(r.login_time).toLocaleTimeString("en-IN")}</strong>
                  </div>
                  <div>
                    <span>Logout</span>
                    <strong>
                      {r.logout_time
                        ? new Date(r.logout_time).toLocaleTimeString("en-IN")
                        : "Still Working"}
                    </strong>
                  </div>
                  <div>
                    <span>Working Hours</span>
                    <strong className="hours">{formatHours(r.working_hours)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}