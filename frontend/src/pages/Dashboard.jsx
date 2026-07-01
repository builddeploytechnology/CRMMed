import "./dashboard.css";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import {
  loginAttendance,
  logoutAttendance,
} from "../api/services/attendanceService";

export default function Dashboard() {
  const navigate = useNavigate();

  // ================= STATES =================

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    calls: 0,
    reminders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [recentCalls, setRecentCalls] = useState([]);

  const [todaySales, setTodaySales] = useState(0);

  const [monthlySales, setMonthlySales] = useState(0);

  const [loading, setLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ================= LIVE CLOCK =================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ================= INITIAL =================

  useEffect(() => {
    fetchDashboard();

    checkAttendance();
  }, []);

  // ================= FETCH =================

  const fetchDashboard =
  async () => {

    try {

      setLoading(true);

      const [

        customersRes,

        ordersRes,

        callsRes,

        remindersRes,

      ] = await Promise.all([

        api.get(
          "/customers?per_page=10000"
        ),

        api.get(
          "/orders?per_page=10000"
        ),

        api.get(
          "/calls?per_page=10000"
        ),

        api.get(
          "/reminders?status=pending&per_page=10000"
        ),
      ]);

      // ================= RESPONSE FIX =================

      const customers =

        Array.isArray(
          customersRes.data?.data
        )

          ? customersRes.data.data

          : Array.isArray(
              customersRes.data?.data?.data
            )

          ? customersRes.data.data.data

          : [];

      const orders =

        Array.isArray(
          ordersRes.data?.data
        )

          ? ordersRes.data.data

          : Array.isArray(
              ordersRes.data?.data?.data
            )

          ? ordersRes.data.data.data

          : [];

      const calls =

        Array.isArray(
          callsRes.data?.data
        )

          ? callsRes.data.data

          : Array.isArray(
              callsRes.data?.data?.data
            )

          ? callsRes.data.data.data

          : [];

      const reminders =

        Array.isArray(
          remindersRes.data?.data
        )

          ? remindersRes.data.data

          : Array.isArray(
              remindersRes.data?.data?.data
            )

          ? remindersRes.data.data.data

          : [];

      // ================= STATS =================

      setStats({

  customers:

    customersRes.data?.data
      ?.meta?.total ||

    customers.length,

  orders:

    ordersRes.data?.data
      ?.meta?.total ||

    orders.length,

  calls:

    callsRes.data?.data
      ?.meta?.total ||

    calls.length,

  reminders:

    remindersRes.data?.data
      ?.meta?.total ||

    reminders.length,
});

      // ================= RECENT =================

      setRecentOrders(
        orders.slice(0, 5)
      );

      setRecentCalls(
        calls.slice(0, 5)
      );

      // ================= SALES =================

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      let todayAmount = 0;

      let totalAmount = 0;

      orders.forEach(
        (item) => {

          const amount =
            Number(
              item.total || 0
            );

          totalAmount +=
            amount;

          if (

            item.date &&

            item.date.includes(
              today
            )

          ) {

            todayAmount +=
              amount;
          }
        }
      );

      setTodaySales(
        todayAmount
      );

      setMonthlySales(
        totalAmount
      );

    } catch (error) {

      console.error(
        error
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= ATTENDANCE =================

  const checkAttendance = async () => {
    try {
      const res = await api.get("/attendance");

      const records = res.data.data || [];

      setIsLoggedIn(records.some((r) => !r.logout_time));
    } catch (error) {
      console.error(error);
    }
  };

  // ================= START =================

  const handleStart = async () => {
    try {
      await loginAttendance();

      setIsLoggedIn(true);
    } catch {
      alert("Failed to start work");
    }
  };

  // ================= END =================

  const handleEnd = async () => {
    try {
      await logoutAttendance();

      setIsLoggedIn(false);
    } catch {
      alert("Failed to end work");
    }
  };
  return (
    <div className="crm-dashboard">
      {/* ================= TOP NAVBAR ================= */}

      <div className="top-navbar">
        <div className="top-left">
          <div className="menu-icon">☰</div>

          <h1>Dashboard</h1>
        </div>

        <div className="top-right">
          {/* DATE */}
          <div className="date-box">
            <span>📅</span>

            <p>
              {currentTime.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                weekday: "long",
              })}
            </p>
          </div>

          {/* TIME */}
          <div className="date-box">
            <span>🕒</span>

            <p>{currentTime.toLocaleTimeString("en-IN")}</p>
          </div>

          {/* ATTENDANCE */}
          <div
            className={`attendance-wrapper ${
              !isLoggedIn ? "attendance-blink" : ""
            }`}
          >
            <button
              onClick={handleStart}
              disabled={isLoggedIn}
              className={`start-btn ${!isLoggedIn ? "blink-btn" : ""}`}
            >
              ▶ Start Work
            </button>

            <button
              onClick={handleEnd}
              disabled={!isLoggedIn}
              className="end-btn"
            >
              ⏹ End Work
            </button>
          </div>
        </div>
      </div>

      {/* ================= LOADING ================= */}

      {loading && <div className="loading-box">Loading Dashboard...</div>}

      {/* ================= STATS ================= */}

      <div className="stats-section">
        {/* CUSTOMERS */}

        <div className="stats-card">
          <div className="stats-icon purple">👥</div>

          <div>
            <p>Total Customers</p>

            <h2>{stats.customers}</h2>

            <small>CRM Customers</small>
          </div>
        </div>

        {/* ORDERS */}

        <div className="stats-card">
          <div className="stats-icon blue">🛒</div>

          <div>
            <p>Total Orders</p>

            <h2>{stats.orders}</h2>

            <small>Orders Created</small>
          </div>
        </div>

        {/* CALLS */}

        <div className="stats-card">
          <div className="stats-icon green">📞</div>

          <div>
            <p>Total Calls</p>

            <h2>{stats.calls}</h2>

            <small>Calls Recorded</small>
          </div>
        </div>

        {/* REMINDERS */}

        <div className="stats-card">
          <div className="stats-icon orange">🔔</div>

          <div>
            <p>Pending Reminders</p>

            <h2>{stats.reminders}</h2>

            <small>Followups Pending</small>
          </div>
        </div>
      </div>

      {/* ================= SALES ================= */}

      <div className="sales-wrapper">
        {/* TODAY SALES */}

        <div className="sales-box">
          <div className="sales-left">
            <div className="sales-icon green-bg">💼</div>

            <div>
              <span>Today's Sales</span>

              <h1>₹{todaySales}</h1>

              <small>Daily Revenue</small>
            </div>
          </div>

          <div className="graph-line green-line"></div>
        </div>

        {/* TOTAL SALES */}

        <div className="sales-box">
          <div className="sales-left">
            <div className="sales-icon blue-bg">📊</div>

            <div>
              <span>Total Sales</span>

              <h1>₹{monthlySales}</h1>

              <small>Overall Business</small>
            </div>
          </div>

          <div className="graph-line blue-line"></div>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <div className="quick-section">
        <h2>Quick Actions</h2>

        <div className="quick-grid">
          <button onClick={() => navigate("/customers")}>
            👤 Add Customer
          </button>

          <button onClick={() => navigate("/orders")}>🛒 Add Order</button>

          <button onClick={() => navigate("/calls")}>📞 Add Call</button>

          <button onClick={() => navigate("/reminders")}>
            🔔 Add Reminder
          </button>

          <button onClick={() => navigate("/stock")}>📦 View Stock</button>
        </div>
      </div>
      {/* ================= MAIN CONTENT ================= */}

      <div className="dashboard-main">
        {/* ================= RECENT ORDERS ================= */}

        <div className="dashboard-card">
          <div className="card-top">
            <h2>Recent Orders</h2>

            <button onClick={() => navigate("/orders")}>View All</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>

                  <th>Product</th>

                  <th>Amount</th>

                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((item, index) => (
                    <tr key={index}>
                      <td>{item.customer_name || "N/A"}</td>

                      <td>{item.product_name || "-"}</td>

                      <td>₹{item.total || 0}</td>

                      <td>{item.date || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty">
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= RECENT CALLS ================= */}

        <div className="dashboard-card">
          <div className="card-top">
            <h2>Recent Calls</h2>

            <button onClick={() => navigate("/calls")}>View All</button>
          </div>

          <div className="calls-container">
            {recentCalls.length > 0 ? (
              recentCalls.map((call, index) => (
                <div key={index} className="call-box">
                  <div>
                    <strong>{call.customer?.name || "Unknown"}</strong>

                    <p>{call.note || "No Notes"}</p>
                  </div>

                  <span className={`status ${call.status || "pending"}`}>
                    {call.status || "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty">No Recent Calls</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
