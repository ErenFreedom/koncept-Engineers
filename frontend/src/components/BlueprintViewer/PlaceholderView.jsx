import React from "react";
import "./PlaceholderView.css";

const PlaceholderView = () => {
  return (
    <div className="placeholder-container">
      <img
        src="/building-silhouette.png"
        alt="Building Silhouette"
        className="placeholder-image"
      />
      <p className="placeholder-text">
        Select a site from the left to view its 3D model and sensor data.
      </p>
    </div>
  );
};

export default PlaceholderView;
