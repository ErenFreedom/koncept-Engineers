import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./BlueprintViewer.css";

// Load and render GLB model
const BuildingModel = () => {
  const { scene } = useGLTF("/building.glb"); 
  return (
    <group scale={[0.8, 0.8, 0.8]} position={[0, -4, 0]}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("/building.glb");

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 10, 20], fov: 40 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <Suspense fallback={null}>
          <BuildingModel />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
