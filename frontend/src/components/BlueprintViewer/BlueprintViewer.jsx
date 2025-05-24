import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./BlueprintViewer.css";

const PlaceholderBuilding = () => {
  const floors = Array.from({ length: 10 }, (_, i) => (
    <mesh key={i} position={[0, i * 2, 0]}>
      <boxGeometry args={[4, 2, 4]} />
      <meshStandardMaterial color={i % 2 === 0 ? "#d0d0d0" : "#a0c4ff"} />
    </mesh>
  ));

  return <group>{floors}</group>;
};

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 12, 25], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <PlaceholderBuilding />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
