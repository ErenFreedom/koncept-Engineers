import React from "react";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="room-overlay">
      <div className="room-header">
        <span className="room-title">{room.name}</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="room-body">
        <p>Room overlay content coming soon...</p>
      </div>
    </div>
  );
};

export default RoomOverlay;
