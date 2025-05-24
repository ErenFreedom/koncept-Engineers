import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HierarchySidebar from "../../components/HierarchySidebar/HierarchySidebar";
import BlueprintViewer from "../../components/BlueprintViewer/BlueprintViewer";
import PlaceholderView from "../../components/BlueprintViewer/PlaceholderView";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, accessToken, logout } = useAuth();

  const [selectedSiteId, setSelectedSiteId] = useState(null); // new state

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
        {/* Pass callback to Sidebar */}
        <HierarchySidebar onSiteSelect={setSelectedSiteId} />
        <div className="dashboard-main-content">
          <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
          <p>Select a room to view sensor data 📟</p>

          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {selectedSiteId ? <BlueprintViewer /> : <PlaceholderView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
