import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HierarchySidebar from "../../components/HierarchySidebar/HierarchySidebar";
import BlueprintViewer from "../../components/BlueprintViewer/BlueprintViewer";
import PlaceholderView from "../../components/BlueprintViewer/PlaceholderView";
import RoomOverlay from "../../components/RoomOverlay/RoomOverlay";

const EngineeringDashboard = ({ admin }) => {
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [focusedFloor, setFocusedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      {/* Mobile sidebar toggle button */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        ☰
      </button>

      <div className="dashboard-body">
        {/* Sidebar panel */}
        <div className={`hierarchy-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <HierarchySidebar
            onSiteSelect={setSelectedSiteId}
            onFloorExpand={(floorId) =>
              setFocusedFloor({ zoomDistance: 1.5, fov: 35, floor: floorId })
            }
            onRoomSelect={setSelectedRoom}
          />
        </div>

        {/* Main content area */}
        <div className="dashboard-main-content">
          <h1>Welcome, {admin.firstName} {admin.lastName}</h1>
          <p>Please select a room to view its sensor data.</p>

          <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
            {selectedSiteId ? (
              <BlueprintViewer focusFloor={focusedFloor} />
            ) : (
              <PlaceholderView />
            )}
          </div>
        </div>

        {/* Room overlay */}
        {selectedRoom && (
          <RoomOverlay room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )}
      </div>
    </div>
  );
};

export default EngineeringDashboard;
