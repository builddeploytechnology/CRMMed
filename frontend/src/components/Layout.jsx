import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="content">
          {children}
        </div>

      </div>

    </div>
  );
}