import React, { useState, useRef, useEffect } from "react";
import { Bell, User } from "lucide-react"; // Import icons
import { useNavigate } from "react-router-dom";

import "./DashboardHeader.css";

const DashboardHeader = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("adminToken");     // destroy token
    localStorage.removeItem("identifier");     // optional: clear cached login
    navigate("/Auth");                         // go to Auth page
  };


  return (
    <header className="dashboard-header">
      <div className="dashboard-logo">
        <img src="/Logo.png" alt="Koncept Engineers Logo" className="logo-image" />
      </div>

      <div className="dashboard-title">Koncept Manager - Overview</div>

      <div className="dashboard-icons">
        <Bell className="notification-icon" />
        <div className="profile-dropdown" ref={dropdownRef}>
          <User
            className="profile-icon"
            onClick={() => setDropdownVisible((prev) => !prev)}
          />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate("/admin/view-profile")}>
                👤 View Profile
              </div>

              <div className="dropdown-item">✏️ Edit Profile</div>
              <div className="dropdown-item">🔐 Change Password</div>
              <div className="dropdown-item">❓ Need Help?</div>
              <div className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
