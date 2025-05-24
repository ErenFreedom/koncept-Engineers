import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./BlueprintViewer.css";

// Placeholder building model made of stacked boxes
const PlaceholderBuilding = () => {
  const floors = 6;
  const boxes = [];
  for (let i = 0; i < floors; i++) {
    boxes.push(
      <mesh key={i} position={[0, i * 1.1, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#cccccc" : "#aaaaaa"} />
      </mesh>
    );
  }
  return <group>{boxes}</group>;
};

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 4, 10], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <PlaceholderBuilding />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
