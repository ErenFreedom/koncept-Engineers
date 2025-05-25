import React from "react";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="room-overlay-container">
      <div className="room-overlay-content">
        <div className="room-overlay-header">
          <h3>{room.name}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="room-overlay-body">
          Room overlay content coming soon...
        </div>
      </div>
    </div>
  );
};

export default RoomOverlay;
