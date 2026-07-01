import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Customers", path: "/customers" },
    { name: "Calls", path: "/calls" },
    { name: "Reminders", path: "/reminders" },
    { name: "Orders", path: "/orders" },
    { name: "Stock", path: "/stock" },
    { name: "Attendance", path: "/attendance" },
  ];

  return (
    <div className="sidebar">

      <h2 className="logo">CRM</h2>

      <ul>
        {menu.map((item, index) => (
          <li
            key={index}
            className={location.pathname === item.path ? "active" : ""}
          >
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>

    </div>
  );
}