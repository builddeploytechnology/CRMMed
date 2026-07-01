import "./navbar.css";

export default function Navbar() {
  // Get user from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  // Real Email from Login Response
  const userEmail = user?.email || user?.Email || "user@example.com";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <h2>CRM Dashboard</h2>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <div className="user-info">
          <span className="user-email">{userEmail}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}