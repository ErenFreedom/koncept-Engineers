import React from "react";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader"; // Importing the Dashboard Header
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import "./Dashboard.css"; // Importing Dashboard-specific CSS

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <DashboardHeader /> {/* Header */}
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>Your overview and controls will appear here.</p>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default Dashboard;
