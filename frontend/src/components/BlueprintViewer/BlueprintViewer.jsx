import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./BlueprintViewer.css";

const BuildingModel = () => {
  const { scene } = useGLTF("/building.glb");

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.side = THREE.DoubleSide; // Ensures no one-sided blackouts
    }
  });

  return <primitive object={scene} scale={0.02} />;
};

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          <BuildingModel />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
