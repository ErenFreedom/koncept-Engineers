import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./BlueprintViewer.css";

// Load building model
const BuildingModel = () => {
  const { scene } = useGLTF("/building.glb");

  // Adjust scale and position so it's centered and fits
  return (
    <group scale={[0.3, 0.3, 0.3]} position={[0, -1.5, 0]}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("/building.glb");

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} />
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
