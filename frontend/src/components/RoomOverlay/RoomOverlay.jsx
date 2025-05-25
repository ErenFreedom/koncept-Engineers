// RoomOverlay.jsx
import React from "react";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="room-overlay-container">
      <button className="overlay-close-btn" onClick={onClose}>✕</button>
      <div className="room-overlay-centered">
        <h2>{room.name}</h2>
        <p className="coming-soon-text">Room overlay content coming soon...</p>
      </div>
    </div>
  );
};

export default RoomOverlay;
