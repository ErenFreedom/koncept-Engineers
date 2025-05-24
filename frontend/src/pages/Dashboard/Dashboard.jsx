import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HierarchySidebar from "../../components/HierarchySidebar/HierarchySidebar";
import BlueprintViewer from "../../components/BlueprintViewer/BlueprintViewer";
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

  if (!admin) return <p>Loading Dashboard...</p>;

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <div className="dashboard-body">
        <HierarchySidebar />
        <div className="dashboard-main-content">
          <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
          <p>Select a room to view sensor data 📟</p>

          {/* Model always visible */}
          <BlueprintViewer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
