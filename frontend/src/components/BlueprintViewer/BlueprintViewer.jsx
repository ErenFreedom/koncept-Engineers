import React from "react";
import "@google/model-viewer";
import "./BlueprintViewer.css";

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <model-viewer
        src="/building.glb"
        alt="3D Koncept Building"
        auto-rotate
        camera-controls
        ar
        style={{ width: "100%", height: "100%" }}
        shadow-intensity="1"
        exposure="1"
        camera-orbit="0deg 75deg 2.5m"
      ></model-viewer>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
