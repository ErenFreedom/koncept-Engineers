import React from "react";
import { Bell, User } from "lucide-react"; // Import icons
import "./DashboardHeader.css";

const DashboardHeader = () => {
  return (
    <header className="dashboard-header">
      <div className="dashboard-logo">
        <img src="/Logo.png" alt="Koncept Engineers Logo" className="logo-image" />
      </div>
      <div className="dashboard-title">Koncept Manager - Overview</div>
      <div className="dashboard-icons">
        <Bell className="notification-icon" /> {/* Notification bell */}
        <User className="profile-icon" /> {/* Profile icon */}
      </div>
    </header>
  );
};

export default DashboardHeader;
