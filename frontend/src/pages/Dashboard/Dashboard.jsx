// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, accessToken, logout } = useAuth();

  useEffect(() => {
    if (!admin || !accessToken) {
      toast.error("Session expired. Please log in again.");
      navigate("/AuthAdmin");
      return;
    }

    if (admin.id.toString() !== id.toString()) {
      toast.error("Unauthorized access!");
      logout();
      navigate("/AuthAdmin");
      return;
    }
  }, [admin, accessToken, id, navigate, logout]);

  if (!admin) return <p className="dashboard-loading">Loading Dashboard...</p>;

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <div className="dashboard-body">
        <h1 className="dashboard-greeting">Hello, {admin.firstName}</h1>
        <h3 className="dashboard-section-title">Quick Access</h3>

        <div className="dashboard-app-grid">
          <div className="dashboard-app-card">
            <img src="/Operational.png" alt="Operational" className="app-icon" />
            <span className="app-label">Operations Manager</span>
          </div>
          <div className="dashboard-app-card">
            <img src="/Accounts.png" alt="Accounts" className="app-icon" />
            <span className="app-label">Accounts</span>
          </div>
          <div className="dashboard-app-card">
            <img src="/Devices.png" alt="Devices" className="app-icon" />
            <span className="app-label">Devices</span>
          </div>
          <div className="dashboard-app-card">
            <img src="/DataSetup.png" alt="Data Setup" className="app-icon" />
            <span className="app-label">Data Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
