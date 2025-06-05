import React, { useEffect, useRef } from "react";
import "@google/model-viewer";
import "./BlueprintViewer.css";

const BlueprintViewer = ({ focusFloor }) => {
  const modelRef = useRef(null);

  useEffect(() => {
    if (!modelRef.current) return;

    if (focusFloor) {
      // Simulate zoom on floor based on index/height
      const orbit = `0deg 65deg ${focusFloor.zoomDistance}m`;
      modelRef.current.cameraOrbit = orbit;
      modelRef.current.fieldOfView = focusFloor.fov;
    }
  }, [focusFloor]);

  return (
    <div className="blueprint-wrapper">
      <model-viewer
        ref={modelRef}
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