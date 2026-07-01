import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    try {
      const res = await api.post("/register", form);

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="login-container">

      <div className="login-right">
        <div className="login-card">
          <h2>Create Account</h2>

          <input
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button onClick={handleRegister}>
            Register
          </button>

          <p onClick={() => navigate("/")}>
            Already have an account? Login
          </p>

        </div>
      </div>

    </div>
  );
}