import React from "react";
import "./PlaceholderView.css";

const PlaceholderView = () => {
  return (
    <div className="placeholder-container">
      <div className="placeholder-image" />
      <p className="placeholder-text">
        Select a site from the left to view its 3D model and sensor data.
      </p>
    </div>
  );
};

export default PlaceholderView;
