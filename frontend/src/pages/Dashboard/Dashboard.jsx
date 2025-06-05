import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HierarchySidebar from "../../components/HierarchySidebar/HierarchySidebar";
import BlueprintViewer from "../../components/BlueprintViewer/BlueprintViewer";
import PlaceholderView from "../../components/BlueprintViewer/PlaceholderView";
import RoomOverlay from "../../components/RoomOverlay/RoomOverlay";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy admin for local testing
  const { accessToken, logout } = useAuth();
  const admin = {
    firstName: "Dev",
    lastName: "User",
    id: "dummy-id"
  };

  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [focusedFloor, setFocusedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Sidebar toggle state

  // Auth check disabled for now
  useEffect(() => {
    // if (!admin || !accessToken) {
    //   toast.error("Session expired. Please log in again.");
    //   navigate("/AuthAdmin");
    //   return;
    // }

    // if (admin.id.toString() !== id.toString()) {
    //   toast.error("Unauthorized access!");
    //   logout();
    //   navigate("/AuthAdmin");
    //   return;
    // }
  }, [admin, accessToken, id, navigate, logout]);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      {/* 📱 Toggle Button for Mobile */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className="dashboard-body">
        {/* Sidebar visible conditionally on small screens */}
        <div className={`hierarchy-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <HierarchySidebar
            onSiteSelect={setSelectedSiteId}
            onFloorExpand={(floorId) =>
              setFocusedFloor({ zoomDistance: 1.5, fov: 35, floor: floorId })
            }
            onRoomSelect={setSelectedRoom}
          />
        </div>

        <div className="dashboard-main-content">
          <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
          <p>Select a room to view sensor data 📟</p>

          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {selectedSiteId ? (
              <BlueprintViewer focusFloor={focusedFloor} />
            ) : (
              <PlaceholderView />
            )}
          </div>
        </div>

        {selectedRoom && (
          <RoomOverlay room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

