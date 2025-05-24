import React, { useEffect, useState } from "react";
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

  const [showModel, setShowModel] = useState(false);
  const [zoomToFloor, setZoomToFloor] = useState(false);

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
        <HierarchySidebar
          onToggleBuilding={() => {
            setShowModel(true);
            setZoomToFloor(false);
          }}
          onToggleFloor={() => {
            setShowModel(true);
            setZoomToFloor(true);
          }}
        />
        <div className="dashboard-main-content">
          <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
          <p>Select a room to view sensor data 📟</p>

          <BlueprintViewer show={showModel} zoomToFloor={zoomToFloor} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
