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
  const { admin, accessToken, logout } = useAuth();

  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [focusedFloor, setFocusedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // 🆕 Room selection

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
          onSiteSelect={setSelectedSiteId}
          onFloorExpand={(floorId) =>
            setFocusedFloor({ zoomDistance: 1.5, fov: 35, floor: floorId })
          }
          onRoomSelect={setSelectedRoom} // 🆕 room click handler
        />

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

        {/* Room Overlay */}
        {selectedRoom && (
          <RoomOverlay room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
