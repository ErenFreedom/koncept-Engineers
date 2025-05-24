import React, { useState } from "react";
import Header from "./Dashboard Components/Header";
import HierarchyTree from "./Dashboard Components/HierarchyTree";
import RoomSensorLoader from "./Dashboard Components/Roomsensor";
import "./Dashboard.css";

const Dashboard = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-['Roboto']">
      {/* Top Header */}
      <Header />

      {/* Main Layout */}
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <div className="hierarchy-panel">
          <h3 className="hierarchy-title">Building</h3>
          <HierarchyTree onSelectRoom={setSelectedRoomId} />
        </div>

        {/* Right Content Area */}
        <div className="content-panel">
          {selectedRoomId ? (
            <div className="content-box">
              <RoomSensorLoader roomId={selectedRoomId} />
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-20 text-sm">
              Select a room to view sensor data 📟
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
