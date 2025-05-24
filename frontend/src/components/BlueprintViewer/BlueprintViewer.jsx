import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./BlueprintViewer.css";

const CubeModel = () => {
  return (
    <mesh scale={2}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="skyblue" />
    </mesh>
  );
};

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} />
        <Suspense fallback={null}>
          <CubeModel />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
