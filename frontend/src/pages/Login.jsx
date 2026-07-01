import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await api.post("/login", { 
        email, 
        password 
      });

      console.log("Login Response:", res.data);   // Debugging ke liye

      // Token Save
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // User Data Save (Important for PDF)
      let userData = null;

      if (res.data.user) {
        userData = res.data.user;
      } 
      else if (res.data.email || res.data.Email) {
        userData = {
          name: res.data.name || res.data.Name || res.data.fullName || "",
          email: res.data.email || res.data.Email || email,
        };
      }

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      alert("Login Successful!");

      // Redirect to Dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>CRM Manage System</h1>
        <p>Manage Customers, Orders, Calls & Attendance in one place</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p onClick={() => navigate("/register")} className="register-link">
            Create Account
          </p>
        </div>
      </div>
    </div>
  );
}