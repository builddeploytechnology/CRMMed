import { useEffect, useState } from "react";
import api from "../api/axios";
import "./reminders.css";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);   // safe default
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Reminder Form
  const [form, setForm] = useState({
    customer_id: "",
    type: "call",
    reminder_datetime: "",
    notes: "",
  });

  // Live Time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Reminders & Customers
  const fetchData = async () => {
    try {
      setLoading(true);
      const [remRes, custRes] = await Promise.all([
        api.get("/reminders"),
        api.get("/customers"),
      ]);

      // Safe handling - agar data array nahi hai to empty array set karo
      setReminders(Array.isArray(remRes.data?.data) ? remRes.data.data : []);
      setCustomers(custRes.data?.data?.data || custRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setReminders([]);   // error mein bhi safe rakho
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add New Reminder
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.reminder_datetime) {
      alert("Customer aur Reminder Date-Time zaroori hai");
      return;
    }

    try {
      await api.post("/reminders", form);
      alert("Reminder successfully added!");
      setForm({ customer_id: "", type: "call", reminder_datetime: "", notes: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add reminder");
    }
  };

  // Mark Reminder as Completed
  const markAsDone = async (id) => {
    if (!window.confirm("Mark this reminder as completed?")) return;

    try {
      await api.post(`/reminders/${id}/done`);
      alert("Reminder marked as completed");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update reminder");
    }
  };

  // Filter Reminders (safe check)
  const filteredReminders = Array.isArray(reminders) 
    ? reminders.filter((r) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          r.customer?.name?.toLowerCase().includes(term) ||
          r.customer?.phone?.toLowerCase().includes(term) ||
          r.notes?.toLowerCase().includes(term)
        );
      })
    : [];

  // Today's and Tomorrow's Reminders
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const todayReminders = filteredReminders.filter(
    (r) => r.reminder_datetime?.split("T")[0] === today
  );

  const tomorrowReminders = filteredReminders.filter(
    (r) => r.reminder_datetime?.split("T")[0] === tomorrow
  );

  return (
    <div className="reminder-container">
      <div className="page-header">
        <h1>⏰ Reminder Management</h1>
        <div className="live-time">
          {currentTime.toLocaleTimeString("en-IN", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit" 
          })}
        </div>
      </div>

      {loading && <p className="loading">Loading reminders...</p>}

      {/* Add New Reminder Form */}
      <div className="reminder-card">
        <h2>Add New Reminder</h2>
        <form onSubmit={handleAddReminder}>
          <div className="form-grid">
            <select
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="call">📞 Call Follow-up</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="task">✅ Task</option>
              <option value="payment">💰 Payment Reminder</option>
              <option value="other">📌 Other</option>
            </select>

            <input
              type="datetime-local"
              value={form.reminder_datetime}
              onChange={(e) => setForm({ ...form, reminder_datetime: e.target.value })}
              required
            />

            <textarea
              placeholder="Notes / Kya baat karni hai..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3"
            />
          </div>

          <button type="submit" className="btn-add">Add Reminder</button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="call-input"
        />
      </div>

      {/* Today's Reminders */}
      <div className="reminder-section">
        <h3>Today's Reminders ({todayReminders.length})</h3>
        {todayReminders.length === 0 ? (
          <p className="no-data">No reminders for today</p>
        ) : (
          todayReminders.map((r) => (
            <div key={r.id} className="reminder-item today">
              <strong>{r.customer?.name}</strong> - {r.type.toUpperCase()}
              <br />
              <small>{new Date(r.reminder_datetime).toLocaleString("en-IN")}</small>
              {r.notes && <p>{r.notes}</p>}
              <button onClick={() => markAsDone(r.id)} className="btn-done">
                Mark as Completed
              </button>
            </div>
          ))
        )}
      </div>

      {/* Tomorrow's Reminders */}
      <div className="reminder-section">
        <h3>Tomorrow's Reminders ({tomorrowReminders.length})</h3>
        {tomorrowReminders.length === 0 ? (
          <p className="no-data">No reminders for tomorrow</p>
        ) : (
          tomorrowReminders.map((r) => (
            <div key={r.id} className="reminder-item">
              <strong>{r.customer?.name}</strong> - {r.type.toUpperCase()}
              <br />
              <small>{new Date(r.reminder_datetime).toLocaleString("en-IN")}</small>
              {r.notes && <p>{r.notes}</p>}
              <button onClick={() => markAsDone(r.id)} className="btn-done">
                Mark as Completed
              </button>
            </div>
          ))
        )}
      </div>

      {/* All Reminders */}
      <div className="reminder-section">
        <h3>All Reminders ({filteredReminders.length})</h3>
        {filteredReminders.length === 0 ? (
          <p className="no-data">No reminders found</p>
        ) : (
          filteredReminders.map((r) => (
            <div key={r.id} className="reminder-item">
              <strong>{r.customer?.name}</strong> ({r.type})
              <br />
              <small>{new Date(r.reminder_datetime).toLocaleString("en-IN")}</small>
              {r.notes && <p>{r.notes}</p>}
              <span className={`status ${r.status}`}>Status: {r.status}</span>
              {r.status !== "completed" && (
                <button onClick={() => markAsDone(r.id)} className="btn-done">
                  Mark Completed
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}